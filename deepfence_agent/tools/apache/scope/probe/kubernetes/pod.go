package kubernetes

import (
	"time"

	"github.com/weaveworks/scope/report"

	apiv1 "k8s.io/api/core/v1"
)

// Pod represents a Kubernetes pod
type Pod interface {
	Meta
	AddParent(topology, id string)
	NodeName() string
	GetNode() (report.Metadata, report.Parent)
	RestartCount() uint
	ContainerNames() []string
	VolumeClaimNames() []string
}

type pod struct {
	*apiv1.Pod
	Meta
	parents  report.Sets
	Node     *apiv1.Node
	HostName string
}

// NewPod creates a new Pod
func NewPod(p *apiv1.Pod, hostName string) Pod {
	return &pod{
		Pod:      p,
		Meta:     meta{p.ObjectMeta},
		parents:  report.MakeSets(),
		HostName: hostName,
	}
}

func (p *pod) UID() string {
	// Following work around is creating issues https://github.com/weaveworks/scope/issues/2931

	// Work around for master pod not reporting the right UID.
	//if hash, ok := p.ObjectMeta.Annotations["kubernetes.io/config.hash"]; ok {
	//	return hash
	//}
	return p.Meta.UID()
}

func (p *pod) AddParent(topology, id string) {
	p.parents = p.parents.AddString(topology, id)
}

func (p *pod) State() string {
	if p.ObjectMeta.DeletionTimestamp != nil {
		return "Terminating"
	}

	return string(p.Status.Phase)
}

func (p *pod) NodeName() string {
	return p.Spec.NodeName
}

func (p *pod) RestartCount() uint {
	count := uint(0)
	for _, cs := range p.Status.ContainerStatuses {
		count += uint(cs.RestartCount)
	}
	return count
}

func (p *pod) VolumeClaimNames() []string {
	var claimNames []string
	for _, volume := range p.Spec.Volumes {
		if volume.VolumeSource.PersistentVolumeClaim != nil {
			claimNames = append(claimNames, volume.VolumeSource.PersistentVolumeClaim.ClaimName)
		}
	}
	return claimNames
}

func (p *pod) GetNode() (report.Metadata, report.Parent) {
	node := report.Metadata{
		Timestamp:                 time.Now().UTC().Format(time.RFC3339Nano),
		NodeID:                    p.UID(),
		NodeName:                  p.Name() + " / " + p.Namespace() + " / " + kubernetesClusterName,
		PodName:                   p.Name(),
		NodeType:                  report.Pod,
		KubernetesClusterName:     kubernetesClusterName,
		KubernetesClusterId:       kubernetesClusterId,
		KubernetesState:           p.State(),
		KubernetesIP:              p.Status.PodIP,
		KubernetesIsInHostNetwork: p.Pod.Spec.HostNetwork,
		KubernetesNamespace:       p.Namespace(),
		HostName:                  p.HostName,
	}
	parent := report.Parent{
		CloudProvider:     cloudProviderNodeId,
		KubernetesCluster: kubernetesClusterId,
		Host:              p.HostName,
		Namespace:         kubernetesClusterId + "-" + p.GetNamespace(),
	}
	return node, parent
}

func (p *pod) ContainerNames() []string {
	containerNames := make([]string, 0, len(p.Pod.Spec.Containers))
	for _, c := range p.Pod.Spec.Containers {
		containerNames = append(containerNames, c.Name)
	}
	return containerNames
}
