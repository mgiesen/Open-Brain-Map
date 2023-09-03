function saveConfig()
{
    localStorage.setItem('CONFIG', JSON.stringify(CONFIG));
}

document.addEventListener('DOMContentLoaded', async () =>
{

    try
    {
        showScreenMessage("Lade Einstellungen", true);
        const chachedConfigExists = await loadConfig();

        if (chachedConfigExists)
        {

            if (CONFIG.mapUrl != "")
            {
                await loadMapFileFromURL(CONFIG.mapUrl);
            }
            else
            {
                showScreenMessage("Aktuell ist keine Map geöffnet");
            }

        }
        else
        {
            showScreenMessage("Aktuell ist keine Map geöffnet");
        }

    } catch (error)
    {
        console.error(error);
        showScreenMessage("Beim Laden der Einstellungen ist ein Fehler aufgetreten");
    }
});

async function loadConfig()
{
    try
    {
        const cachedConfig = await JSON.parse(localStorage.getItem('CONFIG'));

        if (cachedConfig != null)
        {
            CONFIG = cachedConfig;

            return true;
        } else
        {
            return false;
        }
    } catch (error)
    {
        showScreenMessage("Die Einstellungen konnten nicht geladen werden");
        return false;
    }
}

function createNewMap()
{
    DATA = {
        nodes: [
            {
                data: {
                    id: "BASE-NODE",
                    label: "Unbenannte Map",
                    description: "",
                    youtube: "",
                    link: "",
                    background: ""
                }
            }
        ],
        edges: []
    };

    destroyMap();

    buildMap(DATA);
    toggleEditMode(true);
    enableMapFunctions(true);

    document.getElementById("mapPath").innerHTML = "";

    closeScreenMessage();
    closeModal();

}

function loadMap(json, pathArray)
{
    DATA = json;

    destroyMap();

    showScreenMessage("Lade Map aus Web Resource", true);
    setTimeout(async () =>
    {
        buildMap(DATA);
        enableMapFunctions(true);

        if (Array.isArray(pathArray))
        {
            let pathHTML = "<p>";

            pathArray.forEach((pathElement, index) =>
            {
                pathHTML += pathElement;
                if (index < pathArray.length - 1)
                {
                    pathHTML += "<img src='images/pic/arrow_right.svg'>";
                }
            });

            pathHTML += "</p>";

            document.getElementById("mapPath").innerHTML = pathHTML;
        }
        else
        {
            document.getElementById("mapPath").innerHTML = "";
        }

        closeScreenMessage();
    }, 500);
}

async function loadMapFileFromURL(url)
{
    destroyMap();

    closeModal();
    showScreenMessage("Map wird geladen...", true);

    try
    {
        const response = await fetch(url);
        const json = await response.json();

        loadMap(json);

        CONFIG.mapUrl = url;
        saveConfig();
    }
    catch (error)
    {
        CONFIG.mapUrl = "";
        saveConfig();

        console.error('Error loading data:', error);
        showScreenMessage("Map konnte nicht geladen werden", false);
    }
}

function loadMapFromFilesystem()
{
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    fileInput.addEventListener('change', async (event) =>
    {
        destroyMap();

        closeModal();
        showScreenMessage("Map wird geladen...", true);

        const file = event.target.files[0];

        if (file)
        {
            try
            {
                const fileContent = await file.text();
                const json = await JSON.parse(fileContent);

                loadMap(json);

            } catch (error)
            {
                console.error('Error loading data:', error);
                showScreenMessage("Map konnte nicht geladen werden", false);
            }
        }
    });

    fileInput.click();

    CONFIG.mapUrl = "";
    saveConfig();
}

function openMapFromURL()
{
    loadMapFileFromURL(document.getElementById("textbox_map_from_url").value);
}

function openMapFromExample()
{
    loadMapFileFromURL("examples/brainmap_example.json");
}

function showModal(modalId)
{
    const modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => modal.style.display = 'none');

    document.getElementById(modalId).style.display = 'block';
    document.getElementById("modal-background").style.display = 'block';
}

function closeModal()
{
    document.getElementById("modal-background").style.display = 'none';
}

function showScreenMessage(text, loading = false)
{
    document.getElementById("content_status").className = loading ? "loading" : "";
    document.querySelector("#content_status p").innerHTML = text;
}

function closeScreenMessage()
{
    document.getElementById("content_status").className = "hidden";
}

function enableMapFunctions(bool)
{
    if (bool)
    {
        document.getElementById("menu_map_related").classList.remove("disabled");
    }
    else
    {
        document.getElementById("menu_map_related").classList.add("disabled");
    }
}

function destroyMap()
{
    if (CY)
    {
        CY.destroy();
        enableMapFunctions(false);
    }
}

