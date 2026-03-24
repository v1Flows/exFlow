package plugins

import (
	"net/rpc"

	"github.com/JustLABv1/justflow/pkg/contracts"
	"github.com/JustLABv1/runner/config"
	"github.com/hashicorp/go-plugin"
)

// Plugin interface that all plugins must implement
type Plugin interface {
	ExecuteTask(request ExecuteTaskRequest) (Response, error)
	CancelTask(req CancelTaskRequest) (Response, error)
	EndpointRequest(request EndpointRequest) (Response, error)
	Info(request InfoRequest) (models.Plugin, error)
}

// PluginRPC is an implementation of net/rpc for Plugin
type PluginRPC struct {
	Client *rpc.Client
}

type InfoRequest struct {
	Config    *config.Config
	Workspace string
}

type ExecuteTaskRequest struct {
	Args      map[string]string
	Config    *config.Config
	Flow      models.Flows
	FlowBytes []byte
	Execution models.Executions
	Step      models.ExecutionSteps
	Alert     models.Alerts
	Workspace string
}

type CancelTaskRequest struct {
	Step models.ExecutionSteps
}

type EndpointRequest struct {
	Config *config.Config
	Body   []byte
}

type Response struct {
	Data      map[string]interface{}
	Flow      *models.Flows
	FlowBytes []byte
	Alert     *models.Alerts
	Success   bool
	Canceled  bool
}

func (p *PluginRPC) ExecuteTask(request ExecuteTaskRequest) (Response, error) {
	var resp Response
	err := p.Client.Call("Plugin.ExecuteTask", request, &resp)
	return resp, err
}

func (p *PluginRPC) CancelTask(request CancelTaskRequest) (Response, error) {
	var resp Response
	err := p.Client.Call("Plugin.CancelTask", request, &resp)
	return resp, err
}

func (p *PluginRPC) EndpointRequest(request EndpointRequest) (Response, error) {
	var resp Response
	err := p.Client.Call("Plugin.EndpointRequest", request, &resp)
	return resp, err
}

func (p *PluginRPC) Info(request InfoRequest) (models.Plugin, error) {
	var resp models.Plugin
	err := p.Client.Call("Plugin.Info", request, &resp)
	return resp, err
}

// PluginServer is the implementation of plugin.Plugin interface
type PluginServer struct {
	Impl Plugin
}

func (p *PluginServer) Server(*plugin.MuxBroker) (interface{}, error) {
	return &PluginRPCServer{Impl: p.Impl}, nil
}

func (p *PluginServer) Client(b *plugin.MuxBroker, c *rpc.Client) (interface{}, error) {
	return &PluginRPC{Client: c}, nil
}

// PluginRPCServer is the RPC server for Plugin
type PluginRPCServer struct {
	Impl Plugin
}

func (s *PluginRPCServer) ExecuteTask(request ExecuteTaskRequest, resp *Response) error {
	result, err := s.Impl.ExecuteTask(request)
	*resp = result
	return err
}

func (s *PluginRPCServer) CancelTask(request CancelTaskRequest, resp *Response) error {
	result, err := s.Impl.CancelTask(request)
	*resp = result
	return err
}

func (s *PluginRPCServer) EndpointRequest(request EndpointRequest, resp *Response) error {
	result, err := s.Impl.EndpointRequest(request)
	*resp = result
	return err
}

func (s *PluginRPCServer) Info(request InfoRequest, resp *models.Plugin) error {
	result, err := s.Impl.Info(request)
	*resp = result
	return err
}
