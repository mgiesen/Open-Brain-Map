function buildHTMLNode(data)
{
    const node = document.createElement('div');
    node.className = 'node';
    node.style.width = `400px`;
    node.id = data.id;

    const incomingEdges = CY.getElementById(data.id).incomers('edge').length;

    if (incomingEdges === 0)
    {
        node.classList.add("mainNode");
    }

    const nodeBg = document.createElement('div');
    nodeBg.className = 'nodeBg';
    if (data.background)
    {
        nodeBg.style.backgroundImage = "url(" + data.background + ")";
    }

    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'nodeTitle';

    const title = document.createElement('h2');
    title.innerText = data.label;
    titleWrapper.appendChild(title);

    const spacer = document.createElement('div');
    spacer.style.flexGrow = 2;
    titleWrapper.appendChild(spacer);

    if (data.link != "")
    {
        const link = document.createElement('a');
        link.className = 'nodeLink';
        link.href = data.link;
        link.target = '_blank';
        titleWrapper.appendChild(link);
    }

    if (data.youtube != "")
    {
        const youtubeLink = document.createElement('a');
        youtubeLink.className = 'nodeYoutube';
        youtubeLink.href = data.youtube;
        youtubeLink.target = '_blank';
        titleWrapper.appendChild(youtubeLink);
    }

    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = "nodeDescriptionContainer";
    descriptionContainer.style.display = document.getElementById("btn_collapse_nodes").classList.contains("active") ? "flex" : "none";

    const description = document.createElement('p');
    description.innerText = data.description;
    description.className = "nodeDescription";

    descriptionContainer.appendChild(description);

    const btnContainer = document.createElement('div');
    btnContainer.className = "nodeButtonContainer";
    btnContainer.style.display = document.getElementById("btn_node_edit_mode").classList.contains("active") ? "flex" : "none";

    const btnEdit = document.createElement('div');
    btnEdit.classList = "nodeButton nodeEditButton";

    const btnAddBefore = document.createElement('div');
    btnAddBefore.classList = "nodeButton nodeAddBeforeButton";

    const btnAddAfter = document.createElement('div');
    btnAddAfter.classList = "nodeButton nodeAddAfterButton";

    const btnScrape = document.createElement('div');
    btnScrape.classList = "nodeButton nodeScrapeButton";

    const btnRemove = document.createElement('div');
    btnRemove.classList = "nodeButton nodeRemoveButton";

    btnContainer.appendChild(btnEdit);
    btnContainer.appendChild(btnAddAfter);
    btnContainer.appendChild(btnAddBefore);
    btnContainer.appendChild(btnScrape);
    btnContainer.appendChild(btnRemove);

    node.appendChild(nodeBg);
    node.appendChild(titleWrapper);
    node.appendChild(descriptionContainer);
    node.appendChild(btnContainer);

    return node.outerHTML;
}

function getCytoscapeLayout()
{
    return {
        name: 'elk',
        elk: {
            // All options: http://www.eclipse.org/elk/reference.html
            'algorithm': 'disco',
            'componentLayoutAlgorithm': 'stress',
            'stress.desiredEdgeLength': 520,
        },
    };
}

function generateNodeID()
{
    return Date.now().toString(16);
}

function applyCytoscapeHTMLlabel()
{
    CY.nodeHtmlLabel([{
        tpl: function (data)
        {
            return buildHTMLNode(data);
        }
    }]);
}

function buildMap(data)
{
    try
    {
        CY = cytoscape({
            container: document.getElementById('content'),
            layout: getCytoscapeLayout(),
            elements: data,
            style: [
                {
                    selector: 'node',
                    style: {
                        'shape': 'rectangle',
                        'width': 420,
                        'height': 200,
                        'opacity': '0',
                        'visibility': 'hidden'
                    }
                },
            ],
            userZoomingEnabled: true,
            userPanningEnabled: true
        });

        applyCytoscapeHTMLlabel();

        CY.minZoom(0.05);
        CY.maxZoom(2);

    } catch (error)
    {
        showScreenMessage("Die Map enthält leider einen Fehler");
        console.error("Fehler beim Erstellen des Cytoscape-Netzwerks:", error);
    }

}

function refreshMapLayout(centerOnNodeId)
{
    const zoomLevelBeforeLayoutChange = CY.zoom();

    CY.layout(getCytoscapeLayout()).run();

    applyCytoscapeHTMLlabel();

    if (centerOnNodeId)
    {
        /*
        const nodeToCenter = CY.getElementById(centerOnNodeId);

        if (nodeToCenter)
        {
            CY.center(nodeToCenter);
            CY.zoom(zoomLevelBeforeLayoutChange);
        }
        */
    }

}

// ==========================================================================
// NODE EDIT BUTTONS (EDIT | ADD AFTER | ADD BEFORE | CUT | DELETE)
// ==========================================================================

function openNodeEditMode(title, callback, inheritNodeID = undefined)
{
    const modalTitle = document.querySelector('#modalEditNode h2');
    const titleInput = document.querySelector('#modalEditNode input[name="title"]');
    const descriptionInput = document.querySelector('#modalEditNode input[name="description"]');
    const linkInput = document.querySelector('#modalEditNode input[name="link"]');
    const youtubeInput = document.querySelector('#modalEditNode input[name="youtube"]');
    const backgroundInput = document.querySelector('#modalEditNode input[name="background"]');

    modalTitle.innerText = title;

    if (inheritNodeID) 
    {
        const node = document.getElementById(inheritNodeID);

        const link = node.querySelector('.nodeLink');
        const youtubeLink = node.querySelector('.nodeYoutube');

        titleInput.value = node.querySelector('.nodeTitle h2').innerText;
        descriptionInput.value = node.querySelector('.nodeDescription').innerText;

        if (link)
        {
            linkInput.value = link.getAttribute('href') || '';
        }
        else
        {
            linkInput.value = "";
        }

        if (youtubeLink)
        {
            youtubeInput.value = youtubeLink.getAttribute('href') || '';
        }
        else
        {
            youtubeInput.value = "";
        }


        backgroundInput.value = node.querySelector('.nodeBg').style.backgroundImage.replace(/^url\(["']?|["']?\)$/g, '');
    }
    else
    {
        titleInput.value = "";
        descriptionInput.value = "";
        linkInput.value = "";
        youtubeInput.value = "";
        backgroundInput.value = "";
    }

    document.getElementById("btn_apply_node_details").onclick = function ()
    {
        const formElements = {
            titleInput: titleInput.value,
            descriptionInput: descriptionInput.value,
            linkInput: linkInput.value,
            youtubeInput: youtubeInput.value,
            backgroundInput: backgroundInput.value
        };

        callback(formElements);

        closeModal();
    };

    showModal("modalEditNode");
}

function editNode(nodeId)
{
    const callback = function (data)
    {
        const nodeToEdit = CY.getElementById(nodeId);

        if (nodeToEdit)
        {
            nodeToEdit.data('label', data.titleInput);
            nodeToEdit.data('description', data.descriptionInput);
            nodeToEdit.data('link', data.linkInput);
            nodeToEdit.data('youtube', data.youtubeInput);
            nodeToEdit.data('background', data.backgroundInput);
            nodeToEdit.data('new', true);

            refreshMapLayout(nodeId);
        }
    };

    openNodeEditMode("Bearbeiten", callback, nodeId);

    console.log(nodeId);
}

async function addNodeAfterCurrent(nodeId)
{

    const callback = function (data)
    {
        // Find the current node
        const currentNode = CY.getElementById(nodeId);

        // Create the data for the new node
        const newId = generateNodeID(); // Unique ID
        const newNodeData = {
            group: 'nodes',
            data: {
                id: newId,
                label: data.titleInput,
                description: data.descriptionInput,
                youtube: data.youtubeInput,
                link: data.linkInput,
                background: data.backgroundInput,
                new: true
            },
        };

        // Create the data for the new edge from current node to new node
        const newEdgeData = {
            group: 'edges',
            data: {
                source: currentNode.id(),
                target: newId
            },
        };

        // Add the new node and new edge
        CY.add([newNodeData, newEdgeData]);

        // Aktualisiere die Darstellung
        refreshMapLayout(newId);
        toggleEditMode(true);
    };

    openNodeEditMode("Neuer Knoten", callback);

}

async function addNodeBeforeCurrent(nodeId)
{

    const callback = function (data)
    {
        // Finde den aktuellen Knoten und seinen Elternknoten
        const currentNode = CY.getElementById(nodeId);
        const parentEdge = currentNode.connectedEdges().filter(edge => edge.target() === currentNode);
        const parentNode = parentEdge.source();

        // Erzeuge die Daten für den neuen Knoten
        const newId = generateNodeID(); // Eindeutige ID
        const newNodeData = {
            group: 'nodes',
            data: {
                id: newId,
                label: data.titleInput,
                description: data.descriptionInput,
                youtube: data.youtubeInput,
                link: data.linkInput,
                background: data.backgroundInput,
                new: true
            },
        };

        const newEdge1Data = {
            group: 'edges',
            data: {
                source: parentNode.id(),
                target: newId
            }
        };

        const newEdge2Data = {
            group: 'edges',
            data: {
                source: newId,
                target: currentNode.id()
            }
        };

        // Füge den neuen Knoten und die neuen Kanten hinzu
        CY.add([newNodeData, newEdge1Data, newEdge2Data]);

        // Entferne die alte Kante zwischen dem Elternknoten und dem aktuellen Knoten
        parentEdge.remove();

        // Aktualisiere die Darstellung
        refreshMapLayout(newId);
        toggleEditMode(true);
    };

    openNodeEditMode("Neuer Knoten", callback);

}

function mergeParentWithChildren(node)
{
    const parentEdge = node.incomers('edge')[0]; // Annahme: Ein Knoten hat nur einen Elternknoten

    if (parentEdge)
    {
        const parentNode = parentEdge.source();
        const childEdges = node.outgoers('edge');
        const childNodes = childEdges.targets();

        childNodes.forEach(childNode =>
        {
            const newEdgeData = {
                group: 'edges',
                data: {
                    id: 'newEdge' + Date.now(),
                    source: parentNode.id(),
                    target: childNode.id()
                }
            };
            CY.add(newEdgeData);
            childEdges.remove();
        });

        CY.remove(node);
        refreshMapLayout(); //ToDO: Auf neuen Parent Knoten zentrieren
    }
}

function removeNodeAndChildren(nodeId)
{
    const nodeToRemove = CY.getElementById(nodeId);

    if (nodeToRemove)
    {
        const childEdges = nodeToRemove.connectedEdges().filter(edge => edge.source() === nodeToRemove);
        const childNodes = childEdges.map(edge => edge.target());

        // Recursively remove children nodes and their connected edges
        childNodes.forEach(childNode =>
        {
            removeNodeAndChildren(childNode.id());
        });

        CY.remove(nodeToRemove);
        refreshMapLayout();
    }
}

// ==========================================================================
// REGISTER MAP CLICK AND TOUCH EVENTS
// ==========================================================================

document.addEventListener('click', function (event)
{
    const target = event.target;

    if (target.classList.contains('nodeAddBeforeButton'))
    {
        const nodeId = target.closest('.node').id;
        addNodeBeforeCurrent(nodeId);
    }
    else if (target.classList.contains('nodeAddAfterButton'))
    {
        const nodeId = target.closest('.node').id;
        addNodeAfterCurrent(nodeId);
    }
    else if (target.classList.contains('nodeRemoveButton'))
    {
        const nodeElement = target.closest('.node');
        const nodeId = nodeElement.id;
        removeNodeAndChildren(nodeId);
    }
    else if (target.classList.contains('nodeEditButton'))
    {
        const nodeElement = target.closest('.node');
        const nodeId = nodeElement.id;
        editNode(nodeId);
    }
    else if (target.classList.contains('nodeScrapeButton'))
    {
        const nodeElement = target.closest('.node');
        const nodeId = nodeElement.id;
        mergeParentWithChildren(CY.getElementById(nodeId));
    }
});


