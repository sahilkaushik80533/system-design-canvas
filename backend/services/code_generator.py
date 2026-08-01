from typing import Any, Dict, List

# Maps frontend `kind` strings to PyTorch layer constructors
KIND_TO_PYTORCH: Dict[str, str] = {
    "dense": "Linear(in_features=128, out_features={units})",
    "conv2d": "Conv2d(in_channels=3, out_channels={units}, kernel_size=({kernel}))",
    "maxpool2d": "MaxPool2d(kernel_size=2)",
    "lstm": "LSTM(input_size=128, hidden_size={units}, batch_first=True)",
    "dropout": "Dropout(p={dropout_rate})",
    "batchnorm": "BatchNorm1d(num_features={units})",
    "flatten": "Flatten()",
    "embedding": "Embedding(num_embeddings=10000, embedding_dim={units})",
}

# Maps frontend `kind` strings to Docker images and default ports
KIND_TO_DOCKER: Dict[str, Dict[str, Any]] = {
    "database": {"image": "postgres:15", "base_port": 5432, "env": "    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: password\n"},
    "cache": {"image": "redis:alpine", "base_port": 6379, "env": ""},
    "load_balancer": {"image": "nginx:alpine", "base_port": 80, "env": ""},
    "api_gateway": {"image": "kong:latest", "base_port": 8000, "env": ""},
    "message_queue": {"image": "rabbitmq:3-management", "base_port": 5672, "env": ""},
    "server": {"image": "node:20-alpine", "base_port": 3000, "env": ""},
    "cdn": {"image": "nginx:alpine", "base_port": 8080, "env": ""},
    "storage": {"image": "minio/minio:latest", "base_port": 9000, "env": ""},
}


def generate_boilerplate(nodes: list, edges: list) -> str:
    nn_nodes = [n for n in nodes if n.type == "neuralLayer"]
    sys_nodes = [n for n in nodes if n.type == "systemComponent"]
    
    if nn_nodes and len(nn_nodes) >= len(sys_nodes):
        return _generate_pytorch(nn_nodes)
    elif sys_nodes:
        return _generate_docker_compose(sys_nodes)
        
    return "# No recognizable components found to generate code for."


def _generate_pytorch(nn_nodes: list) -> str:
    code = "import torch\nimport torch.nn as nn\n\nclass NeuralNetwork(nn.Module):\n    def __init__(self):\n        super(NeuralNetwork, self).__init__()\n"
    
    for idx, node in enumerate(nn_nodes, start=1):
        kind = node.data.get("kind", "dense")
        params = node.data.get("params", {})
        label = node.data.get("label", f"layer_{idx}").replace(" ", "_").replace("-", "_").lower()
        
        # Build layer string from template
        template = KIND_TO_PYTORCH.get(kind, "Linear(in_features=128, out_features=64)")
        layer_str = template.format(
            units=params.get("units", 64),
            kernel=",".join(str(k) for k in params.get("kernelSize", [3, 3])),
            dropout_rate=params.get("dropoutRate", 0.5),
        )
        code += f"        self.{label} = nn.{layer_str}\n"
    
    code += "\n    def forward(self, x):\n"
    for idx, node in enumerate(nn_nodes, start=1):
        label = node.data.get("label", f"layer_{idx}").replace(" ", "_").replace("-", "_").lower()
        code += f"        x = self.{label}(x)\n"
    code += "        return x\n"
    
    return code


def _generate_docker_compose(sys_nodes: list) -> str:
    code = "version: '3.8'\nservices:\n"
    used_ports: dict[int, int] = {}  # base_port -> count of uses
    
    for node in sys_nodes:
        kind = node.data.get("kind", "")
        label = node.data.get("label", f"service_{node.id}").replace(" ", "_").lower()
        
        docker_info = KIND_TO_DOCKER.get(kind)
        if docker_info:
            image = docker_info["image"]
            base_port = docker_info["base_port"]
            env_block = docker_info["env"]
            
            # Avoid port conflicts: offset host port if base_port already used
            count = used_ports.get(base_port, 0)
            host_port = base_port + count
            used_ports[base_port] = count + 1
            
            code += f"  {label}:\n"
            code += f"    image: {image}\n"
            code += f"    ports:\n      - \"{host_port}:{base_port}\"\n"
            if env_block:
                code += env_block
        else:
            code += f"  {label}:\n"
            code += "    build: .\n"
            code += f"    ports:\n      - \"8080:8080\"\n"
            
    return code
