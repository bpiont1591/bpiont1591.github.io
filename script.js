var myText = document.getElementById("myText");
var textList = ["DBM", "PHP", "HTML"];
var index = 0;

function changeText() {
  myText.innerHTML = textList[index];
  index++;
  if (index >= textList.length) {
    index = 0;
  }
}

setInterval(changeText, 2000);