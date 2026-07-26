def generate_boilerplate(nodes: list, edges: list) -> str:
    nn_nodes = [n for n in nodes if n.type == "neuralLayer"]
    sys_nodes = [n for n in nodes if n.type == "systemComponent"]
    
    if nn_nodes and len(nn_nodes) >= len(sys_nodes):
        code = "import torch\nimport torch.nn as nn\n\nclass NeuralNetwork(nn.Module):\n    def __init__(self):\n        super(NeuralNetwork, self).__init__()\n"
        
        seq_idx = 1
        for node in nn_nodes:
            layer_type = node.data.get("layerType", "Linear")
            label = node.data.get("label", f"layer_{seq_idx}").replace(" ", "_").lower()
            code += f"        self.{label} = nn.{layer_type}()\n"
            seq_idx += 1
            
        code += "\n    def forward(self, x):\n"
        code += "        # Implement forward pass\n"
        code += "        pass\n"
        return code
        
    elif sys_nodes:
        code = "version: '3.8'\nservices:\n"
        fallback_port = 8080
        
        for node in sys_nodes:
            kind = node.data.get("kind", "")
            label = node.data.get("label", f"service_{node.id}").replace(" ", "_").lower()
            
            code += f"  {label}:\n"
            if kind == "database":
                code += "    image: postgres:15\n"
                code += "    ports:\n      - \"5432:5432\"\n"
                code += "    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: password\n"
            elif kind == "cache" or kind == "redis":
                code += "    image: redis:alpine\n"
                code += "    ports:\n      - \"6379:6379\"\n"
            elif kind == "load_balancer":
                code += "    image: nginx:alpine\n"
                code += "    ports:\n      - \"80:80\"\n"
            elif kind == "api_gateway":
                code += "    image: kong:latest\n"
                code += "    ports:\n      - \"8000:8000\"\n"
            else:
                code += "    build: .\n"
                code += f"    ports:\n      - \"{fallback_port}:{fallback_port}\"\n"
                fallback_port += 1
                
        return code
        
    return "# No recognizable components found to generate code for."
