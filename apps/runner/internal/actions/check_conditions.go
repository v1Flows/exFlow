package internal_actions

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/JustLABv1/runner/pkg/executions"

	log "github.com/sirupsen/logrus"
)

func CheckConditions(cfg *config.Config, steps []models.ExecutionSteps, step models.ExecutionSteps, execution models.Executions) (bool, error) {
	err := executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
		ID: step.ID,
		Messages: []models.Message{
			{
				Title: "Condition Check",
				Lines: []models.Line{
					{
						Content:   "There are conditions set for this action. Checking...",
						Color:     "primary",
						Timestamp: time.Now(),
					},
				},
			},
		},
		Status: "running",
	})
	if err != nil {
		return false, err
	}

	// get all steps from the backend (messages are important here)
	executionSteps, err := executions.GetSteps(cfg, execution.ID.String())
	if err != nil {
		log.Error(err)
		return false, err
	}

	// search for condition selected action id in executionsSteps
	for _, execStep := range executionSteps {
		if execStep.Action.ID.String() == step.Action.Condition.SelectedActionID {
			err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
				ID: step.ID,
				Messages: []models.Message{
					{
						Title: "Condition Check",
						Lines: []models.Line{
							{
								Content:   "Conditions apply to the following Action: " + execStep.Action.Name + " (" + execStep.Action.ID.String() + ")",
								Timestamp: time.Now(),
							},
						},
					},
				},
				Status: "running",
			})
			if err != nil {
				return false, err
			}

			// Evaluate all conditions with AND/OR logic
			conditionResults := []bool{}
			conditionLogic := []string{}

			for i, condition := range step.Action.Condition.ConditionItems {
				err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
					ID: step.ID,
					Messages: []models.Message{
						{
							Title: "Condition Check",
							Lines: []models.Line{
								{
									Content:   fmt.Sprintf("Processing condition %d: %s %s %s", i+1, condition.ConditionKey, condition.ConditionType, condition.ConditionValue),
									Timestamp: time.Now(),
								},
							},
						},
					},
					Status: "running",
				})
				if err != nil {
					return false, err
				}

				conditionMet := false

				// status check
				if condition.ConditionKey == "status" {
					if condition.ConditionType == "equals" {
						conditionMet = execStep.Status == condition.ConditionValue
					} else if condition.ConditionType == "not_equals" {
						conditionMet = execStep.Status != condition.ConditionValue
					}
				}

				// message check
				if condition.ConditionKey == "message" {
					// Get all messages as a single string for checking
					allMessages := ""
					for _, message := range execStep.Messages {
						for _, line := range message.Lines {
							allMessages += line.Content + " "
						}
					}

					if condition.ConditionType == "equals" {
						conditionMet = allMessages == condition.ConditionValue
					} else if condition.ConditionType == "not_equals" {
						conditionMet = allMessages != condition.ConditionValue
					} else if condition.ConditionType == "contains" {
						conditionMet = strings.Contains(allMessages, condition.ConditionValue)
					} else if condition.ConditionType == "not_contains" {
						conditionMet = !strings.Contains(allMessages, condition.ConditionValue)
					} else if condition.ConditionType == "regex" {
						// Use regular expression matching - check against individual lines first, then combined
						matched := false
						regexErr := error(nil)

						// First check each individual line for line-based patterns (^, $, etc.)
						for _, message := range execStep.Messages {
							for _, line := range message.Lines {
								lineMatched, err := regexp.MatchString(condition.ConditionValue, line.Content)
								if err != nil {
									regexErr = err
									break
								}
								if lineMatched {
									matched = true
									break
								}
							}
							if matched || regexErr != nil {
								break
							}
						}

						// If no line matched and no error, also try against the combined string
						// This handles patterns that might span across lines
						if !matched && regexErr == nil {
							matched, regexErr = regexp.MatchString(condition.ConditionValue, allMessages)
						}

						if regexErr != nil {
							log.Errorf("Invalid regex pattern '%s': %v", condition.ConditionValue, regexErr)
							// Log the regex error
							err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
								ID: step.ID,
								Messages: []models.Message{
									{
										Title: "Condition Check",
										Lines: []models.Line{
											{
												Content:   fmt.Sprintf("Invalid regex pattern '%s': %v", condition.ConditionValue, regexErr),
												Color:     "danger",
												Timestamp: time.Now(),
											},
										},
									},
								},
								Status: "running",
							})
							if err != nil {
								return false, err
							}
							conditionMet = false
						} else {
							conditionMet = matched
						}
					}
				}

				// Log condition result
				resultMsg := "did not match"
				resultColor := "danger"
				if conditionMet {
					resultMsg = "matched"
					resultColor = "success"
				}

				err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
					ID: step.ID,
					Messages: []models.Message{
						{
							Title: "Condition Check",
							Lines: []models.Line{
								{
									Content:   fmt.Sprintf("Condition %d %s", i+1, resultMsg),
									Color:     resultColor,
									Timestamp: time.Now(),
								},
							},
						},
					},
					Status: "running",
				})
				if err != nil {
					return false, err
				}

				conditionResults = append(conditionResults, conditionMet)
				if condition.ConditionLogic != "" {
					conditionLogic = append(conditionLogic, condition.ConditionLogic)
				}
			}

			// Evaluate combined result with AND/OR logic
			finalResult := conditionResults[0] // Start with first condition result

			for i, logic := range conditionLogic {
				if i+1 < len(conditionResults) {
					if logic == "and" {
						finalResult = finalResult && conditionResults[i+1]
					} else if logic == "or" {
						finalResult = finalResult || conditionResults[i+1]
					}
				}
			}

			// Log final result
			finalMsg := "All conditions evaluation completed. Result: "
			finalColor := "danger"
			if finalResult {
				finalMsg += "PASSED"
				finalColor = "success"
			} else {
				finalMsg += "FAILED"
			}

			err = executions.UpdateStep(nil, execution.ID.String(), models.ExecutionSteps{
				ID: step.ID,
				Messages: []models.Message{
					{
						Title: "Condition Check",
						Lines: []models.Line{
							{
								Content:   finalMsg,
								Color:     finalColor,
								Timestamp: time.Now(),
							},
						},
					},
				},
				Status: "running",
			})
			if err != nil {
				return false, err
			}

			return finalResult, nil
		}
	}

	return false, nil
}
