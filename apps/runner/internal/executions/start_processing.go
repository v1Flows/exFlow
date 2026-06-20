package internal_executions

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	jf_models "github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/internal/cleanup"
	internal_justflow "github.com/JustLABv1/runner/internal/justflow"
	"github.com/JustLABv1/runner/internal/runner"
	"github.com/JustLABv1/runner/pkg/executions"
	"github.com/JustLABv1/runner/pkg/plugins"
	"github.com/google/uuid"

	log "github.com/sirupsen/logrus"
)

func startProcessing(actions []jf_models.Action, loadedPlugins map[string]plugins.Plugin, execution jf_models.Executions, alertID string) {
	configManager := config.GetInstance()
	cfg := configManager.GetConfig()

	// ensure that execution runnerid equals the config runnerid
	if execution.RunnerID != configManager.GetRunnerID() {
		log.Warnf("Execution %s is already picked up by another runner", execution.ID)
		return
	}

	// Start sending heartbeats
	doneHeartbeat := make(chan struct{})
	go func() {
		for {
			select {
			case <-doneHeartbeat:
				// Stop sending heartbeats when done
				return
			default:
				// Send a heartbeat
				executions.SendHeartbeat(nil, execution)
				// Wait for a short interval before sending the next heartbeat
				time.Sleep(5 * time.Second) // Adjust the interval as needed
			}
		}
	}()

	// create workspace dir for execution
	workspace := fmt.Sprintf("%s/%s", cfg.WorkspaceDir, execution.ID)
	err := os.MkdirAll(workspace, 0755)
	if err != nil {
		log.Error("Error creating workspace dir: ", err)
	}

	execution.Status = "running"
	execution.ExecutedAt = time.Now()

	err = executions.UpdateExecution(nil, execution)
	if err != nil {
		postProcessing(cfg, execution, jf_models.Flows{}, "error")
		executions.EndWithError(nil, execution)
		// Stop heartbeats and finish processing
		close(doneHeartbeat)
		finishProcessing(cfg, execution, jf_models.Flows{})
		return
	}

	// set runner to busy
	runner.Busy(true)

	// send initial step
	var initialSteps []jf_models.ExecutionSteps
	initialSteps, err = internal_justflow.SendInitialSteps(cfg, actions, execution)
	if err != nil {
		postProcessing(cfg, execution, jf_models.Flows{}, "error")
		executions.EndWithError(nil, execution)
		// Stop heartbeats and finish processing
		close(doneHeartbeat)
		finishProcessing(cfg, execution, jf_models.Flows{})
		return
	}

	// process each initial step where pending is true
	var flow jf_models.Flows
	var flowBytes []byte
	var alert jf_models.Alerts
	for _, step := range initialSteps {
		if step.Status == "pending" {
			res, success, canceled, err := processStep(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, initialSteps, step, execution)
			if err != nil {
				log.Error("Error processing initial step: ", err)
				// cancel remaining steps
				cancelRemainingSteps(execution.ID.String())
				postProcessing(cfg, execution, flow, "error")
				// end execution
				executions.EndWithError(nil, execution)
				// Stop heartbeats and finish processing
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}

			if canceled {
				cancelRemainingSteps(execution.ID.String())
				postProcessing(cfg, execution, flow, "canceled")
				executions.EndCanceled(nil, execution)
				// Stop heartbeats and finish processing
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}

			if res.Flow != nil {
				flow = *res.Flow
			} else if flow.ID == uuid.Nil {
				log.Error("Error parsing flow")
				cancelRemainingSteps(execution.ID.String())
				postProcessing(cfg, execution, flow, "error")
				executions.EndWithError(nil, execution)
				// Stop heartbeats and finish processing
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}

			if len(res.FlowBytes) > 0 {
				flowBytes = res.FlowBytes
			}

			if res.Alert != nil {
				alert = *res.Alert
			} else if flow.Type == "alert" && alert.ID == uuid.Nil {
				log.Error("Error parsing alert")
				cancelRemainingSteps(execution.ID.String())
				postProcessing(cfg, execution, flow, "error")
				executions.EndWithError(nil, execution)
				// Stop heartbeats and finish processing
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}

			if res.Data["status"] == "noPatternMatch" {
				cancelRemainingSteps(execution.ID.String())
				postProcessing(cfg, execution, flow, "noPatternMatch")
				executions.EndNoPatternMatch(nil, execution)
				// Stop heartbeats and finish processing
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}

			if res.Data["status"] == "canceled" {
				cancelRemainingSteps(execution.ID.String())
				postProcessing(cfg, execution, flow, "canceled")
				executions.EndCanceled(nil, execution)
				// Stop heartbeats and finish processing
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}

			if !success {
				cancelRemainingSteps(execution.ID.String())
				postProcessing(cfg, execution, flow, "error")
				executions.EndWithError(nil, execution)
				// Stop heartbeats and finish processing
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}
		}
	}

	// send flow actions as steps to justflow
	flowActionStepsWithIDs, err := sendFlowActionSteps(cfg, execution, flow)
	if err != nil {
		postProcessing(cfg, execution, flow, "error")
		executions.EndWithError(nil, execution)
		// Stop heartbeats and finish processing
		close(doneHeartbeat)
		finishProcessing(cfg, execution, flow)
		return
	}

	if flow.UseDag {
		result := runDAG(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, flowActionStepsWithIDs, execution)
		switch result {
		case "recovered":
			postProcessing(cfg, execution, flow, "recovered")
			executions.EndWithRecovered(nil, execution)
		case "canceled":
			cancelRemainingSteps(execution.ID.String())
			postProcessing(cfg, execution, flow, "canceled")
			executions.EndCanceled(nil, execution)
		case "noPatternMatch":
			cancelRemainingSteps(execution.ID.String())
			postProcessing(cfg, execution, flow, "noPatternMatch")
			executions.EndNoPatternMatch(nil, execution)
		case "error":
			cancelRemainingSteps(execution.ID.String())
			postProcessing(cfg, execution, flow, "error")
			executions.EndWithError(nil, execution)
		default:
			postProcessing(cfg, execution, flow, "success")
			executions.EndSuccess(nil, execution)
		}
		close(doneHeartbeat)
		finishProcessing(cfg, execution, flow)
		return
	}

	if !flow.ExecParallel {
		// process each flow action step in sequential order where pending is true
		for _, step := range flowActionStepsWithIDs {
			if step.Status == "pending" {
				res, success, canceled, err := processStep(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, flowActionStepsWithIDs, step, execution)
				if err != nil {
					// cancel remaining steps
					cancelRemainingSteps(execution.ID.String())

					// start failure pipeline
					if flow.FailurePipelineID != "" || step.Action.FailurePipelineID != "" {
						err = startFailurePipeline(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, flowActionStepsWithIDs, step, execution)
						if err != nil {
							postProcessing(cfg, execution, flow, "error")
							executions.EndWithError(nil, execution)
							// Stop heartbeats and finish processing
							close(doneHeartbeat)
							finishProcessing(cfg, execution, flow)
							return
						}

						postProcessing(cfg, execution, flow, "recovered")
						executions.EndWithRecovered(nil, execution)
						// Stop heartbeats and finish processing
						close(doneHeartbeat)
						finishProcessing(cfg, execution, flow)
						return
					}

					postProcessing(cfg, execution, flow, "error")
					executions.EndWithError(nil, execution)
					// Stop heartbeats and finish processing
					close(doneHeartbeat)
					finishProcessing(cfg, execution, flow)
					return
				}

				if res.Data["status"] == "noPatternMatch" {
					cancelRemainingSteps(execution.ID.String())
					postProcessing(cfg, execution, flow, "noPatternMatch")
					executions.EndNoPatternMatch(nil, execution)
					// Stop heartbeats and finish processing
					close(doneHeartbeat)
					finishProcessing(cfg, execution, flow)
					return
				}

				if res.Data["status"] == "canceled" {
					cancelRemainingSteps(execution.ID.String())
					postProcessing(cfg, execution, flow, "canceled")
					executions.EndCanceled(nil, execution)
					// Stop heartbeats and finish processing
					close(doneHeartbeat)
					finishProcessing(cfg, execution, flow)
					return
				}

				if canceled {
					cancelRemainingSteps(execution.ID.String())
					postProcessing(cfg, execution, flow, "canceled")
					executions.EndCanceled(nil, execution)
					// Stop heartbeats and finish processing
					close(doneHeartbeat)
					finishProcessing(cfg, execution, flow)
					return
				}

				if !success {
					cancelRemainingSteps(execution.ID.String())

					// start failure pipeline if enabled
					if flow.FailurePipelineID != "" || step.Action.FailurePipelineID != "" {
						err = startFailurePipeline(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, flowActionStepsWithIDs, step, execution)
						if err != nil {
							postProcessing(cfg, execution, flow, "error")
							executions.EndWithError(nil, execution)
							// Stop heartbeats and finish processing
							close(doneHeartbeat)
							finishProcessing(cfg, execution, flow)
							return
						}

						postProcessing(cfg, execution, flow, "recovered")
						// end execution with recovered status
						executions.EndWithRecovered(nil, execution)
						// Stop heartbeats and finish processing
						close(doneHeartbeat)
						finishProcessing(cfg, execution, flow)
						return
					}

					postProcessing(cfg, execution, flow, "error")
					executions.EndWithError(nil, execution)
					// Stop heartbeats and finish processing
					close(doneHeartbeat)
					finishProcessing(cfg, execution, flow)
					return
				}
			}
		}
	} else {
		type stepResult struct {
			failed         bool
			canceled       bool
			noPatternMatch bool
			step           jf_models.ExecutionSteps
		}

		var wg sync.WaitGroup
		resultsCh := make(chan stepResult, len(flowActionStepsWithIDs))

		for _, step := range flowActionStepsWithIDs {
			if step.Status == "pending" {
				wg.Add(1)
				step := step // capture loop variable
				go func() {
					defer wg.Done()
					r := stepResult{step: step}
					res, success, canceled, err := processStep(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, flowActionStepsWithIDs, step, execution)
					if err != nil || !success {
						r.failed = true
					}
					if res.Data["status"] == "noPatternMatch" {
						r.noPatternMatch = true
					}
					if res.Data["status"] == "canceled" || canceled {
						r.canceled = true
					}
					resultsCh <- r
				}()
			}
		}

		wg.Wait()
		close(resultsCh)

		var failedSteps, canceledSteps, noPatternMatchSteps int
		var firstFailedStep jf_models.ExecutionSteps
		for r := range resultsCh {
			if r.failed {
				if failedSteps == 0 {
					firstFailedStep = r.step
				}
				failedSteps++
			}
			if r.canceled {
				canceledSteps++
			}
			if r.noPatternMatch {
				noPatternMatchSteps++
			}
		}

		if failedSteps > 0 {
			if flow.FailurePipelineID != "" || firstFailedStep.Action.FailurePipelineID != "" {
				err = startFailurePipeline(cfg, workspace, actions, loadedPlugins, flow, flowBytes, alert, flowActionStepsWithIDs, firstFailedStep, execution)
				if err != nil {
					postProcessing(cfg, execution, flow, "error")
					executions.EndWithError(nil, execution)
					close(doneHeartbeat)
					finishProcessing(cfg, execution, flow)
					return
				}

				postProcessing(cfg, execution, flow, "recovered")
				executions.EndWithRecovered(nil, execution)
				close(doneHeartbeat)
				finishProcessing(cfg, execution, flow)
				return
			}

			postProcessing(cfg, execution, flow, "error")
			executions.EndWithError(nil, execution)
			close(doneHeartbeat)
			finishProcessing(cfg, execution, flow)
			return
		}

		if canceledSteps > 0 {
			postProcessing(cfg, execution, flow, "canceled")
			executions.EndCanceled(nil, execution)
			close(doneHeartbeat)
			finishProcessing(cfg, execution, flow)
			return
		}

		if noPatternMatchSteps > 0 {
			postProcessing(cfg, execution, flow, "noPatternMatch")
			executions.EndNoPatternMatch(nil, execution)
			close(doneHeartbeat)
			finishProcessing(cfg, execution, flow)
			return
		}
	}

	postProcessing(cfg, execution, flow, "success")
	executions.EndSuccess(nil, execution)

	// Stop heartbeats and finish processing
	close(doneHeartbeat)
	finishProcessing(cfg, execution, flow)
}

func postProcessing(cfg *config.Config, execution models.Executions, flow models.Flows, execStatus string) {
	err := cleanup.PerformWorkspaceCleanup(cfg, execution, flow, execStatus)
	if err != nil {
		log.Error("Error during workspace cleanup: ", err)
	}
}

func finishProcessing(cfg *config.Config, execution jf_models.Executions, flow jf_models.Flows) {
	runner.Busy(false)
}
