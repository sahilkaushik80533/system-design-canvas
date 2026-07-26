from typing import List, Dict, Any

def evaluate_nn_architecture(nodes: List[Any], edges: List[Any]) -> Dict[str, Any]:
    warnings = []
    recommendations = []
    valid = True

    if not nodes:
        return {"valid": True, "layer_count": 0, "warnings": warnings, "recommendations": recommendations}

    # Build adjacency list to trace layer connections
    adj = {n.id: [] for n in nodes}
    for e in edges:
        if e.source in adj:
            adj[e.source].append(e.target)

    # Fast lookup for nodes
    node_map = {n.id: n for n in nodes}

    for node in nodes:
        kind = node.data.get("kind", "")
        
        # Rule 1: Check if Conv2D connects directly to Dense without a Flatten layer
        if kind == "conv2d":
            for target_id in adj.get(node.id, []):
                target_node = node_map.get(target_id)
                if target_node and target_node.data.get("kind") == "dense":
                    warnings.append(f"Conv2D '{node.data.get('label', node.id)}' connects directly to Dense '{target_node.data.get('label', target_node.id)}'.")
                    recommendations.append("Insert a Flatten or GlobalPooling layer between Conv2D and Dense.")
                    valid = False

    # Rule 2: Check if the final output layer specifies an activation function
    # Terminal nodes are those with an out-degree of 0 (no outgoing edges)
    terminal_nodes = [n for n in nodes if not adj.get(n.id)]
    
    for node in terminal_nodes:
        if node.data.get("kind") == "dense":
            params = node.data.get("params", {})
            activation = params.get("activation", "none")
            
            if activation in ("none", "relu", "", None):
                label = node.data.get('label', node.id)
                warnings.append(f"Terminal Dense layer '{label}' is missing a standard output activation function.")
                recommendations.append(f"Use 'softmax' (for multi-class classification) or 'sigmoid' (for binary) on the final output layer '{label}'.")
                valid = False

    return {
        "valid": valid,
        "layer_count": len(nodes),
        "warnings": warnings,
        "recommendations": recommendations
    }
