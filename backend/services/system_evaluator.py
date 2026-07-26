from typing import List, Dict, Any

def evaluate_system_architecture(nodes: List[Any], edges: List[Any]) -> Dict[str, Any]:
    warnings = []
    recommendations = []
    scores = {"Scalability": 0, "Fault Tolerance": 0, "Efficiency": 0}

    if not nodes:
        return {"scores": scores, "warnings": warnings, "recommendations": recommendations}

    connected_node_ids = set()
    for edge in edges:
        connected_node_ids.add(edge.source)
        connected_node_ids.add(edge.target)

    db_count = 0
    lb_count = 0
    replicas_sum = 0

    for node in nodes:
        # Check for isolated nodes
        if node.id not in connected_node_ids and len(nodes) > 1:
            label = node.data.get('label', node.type)
            warnings.append(f"Node '{label}' is isolated.")
            recommendations.append(f"Connect '{label}' to other components.")

        kind = node.data.get("kind", "")
        params = node.data.get("params", {})
        
        if kind == "database":
            db_count += 1
            replicas = params.get("replicas", 1)
            if replicas < 2:
                label = node.data.get('label', node.type)
                warnings.append(f"Database '{label}' has no replicas (Single Point of Failure).")
                recommendations.append(f"Increase database '{label}' replicas to at least 2 for fault tolerance.")
            replicas_sum += replicas
                
        if kind == "load_balancer":
            lb_count += 1

    if db_count > 0 and lb_count == 0:
        warnings.append("System has a database but no Load Balancer.")
        recommendations.append("Add a Load Balancer to distribute traffic to your components.")

    # Calculate standard metric scores based on mock rules
    scores["Scalability"] = min(100, 40 + (lb_count * 30) + (replicas_sum * 10))
    scores["Fault Tolerance"] = min(100, 30 + (replicas_sum * 20))
    
    isolated_penalty = (len(nodes) - len(connected_node_ids)) * 10 if len(nodes) > len(connected_node_ids) else 0
    scores["Efficiency"] = max(0, 80 - isolated_penalty)

    return {
        "scores": scores,
        "warnings": warnings,
        "recommendations": recommendations
    }
