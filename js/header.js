function toggleNodeDescription(foreActivation = undefined)
{
    const button = document.getElementById("btn_collapse_nodes");
    const buttonImg = button.querySelector("img");

    const nodes = document.querySelectorAll('.nodeDescriptionContainer');

    const state = foreActivation != undefined ? foreActivation : button.classList.contains("active") == false;

    if (state)
    {
        button.classList.add("active");
        buttonImg.src = "images/buttons/minimize.svg";
        CONFIG.enable_node_description = true;
    }
    else
    {
        button.classList.remove("active");
        buttonImg.src = "images/buttons/maximize.svg";
        CONFIG.enable_node_description = false;
    }

    nodes.forEach(node =>
    {
        node.style.display = (state ? 'flex' : 'none');
    });

}

function toggleEditMode(foreActivation = undefined) 
{
    const button = document.getElementById("btn_node_edit_mode");
    const nodes = document.querySelectorAll('.nodeButtonContainer');

    const state = foreActivation != undefined ? foreActivation : button.classList.contains("active") == false;

    if (state)
    {
        button.classList.add("active");
    }
    else
    {
        button.classList.remove("active");
    }

    nodes.forEach(node =>
    {
        node.style.display = (state ? 'flex' : 'none');
    });
}

function centerAndReset() 
{
    CY.ready(function ()
    {
        CY.fit();
    });
}

function downloadData()
{
    const { nodes, edges } = CY.json().elements;

    const reducedNodes = nodes.map(node => ({ data: node.data }));

    const reducedEdges = edges.map(edge =>
    {
        const { id, ...data } = edge.data;
        return { data };
    });

    const reducedJson = {
        nodes: reducedNodes,
        edges: reducedEdges
    };

    const jsonContent = JSON.stringify(reducedJson, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainmap.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    a.remove();
}





