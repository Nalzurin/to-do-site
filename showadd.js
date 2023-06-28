function ShowAddWindow(){
  console.log("Button clicked");
  document.getElementById("addoverlay").style.display = "block";
}
function DescWindowToggle(e){
    var element = document.querySelector(`[data-note-id="${e}"]`);
    if(getComputedStyle(element.children[1]).display == "none")
    {
        element.children[1].style.display = "block";
    }
    else
    {
        element.children[1].style.display = "none";
    }

}