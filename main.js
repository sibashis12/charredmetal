let curScore=0;
//0 is pending, 1 is finished
let ifSelected, isClicked=0, lifeLines=1;
let colors=["red", "#808000","blue", "#008080", "green", "#800080"];
let varTimer;
/*Helper Functions*/
function addColorChanger(element){
    element.addEventListener("mouseover", ()=>{
        let colorInd=0;
        varTimer=setInterval(()=>{
            element.style.color=colors[colorInd];
            colorInd++;
            if(colorInd==colors.length){
                colorInd=0;
            }
        }, 1000);
    });
    element.addEventListener("mouseout", ()=>{
        clearInterval(varTimer);
    });
}

function removeColorChanger(element){
    element.removeEventListener("mouseover", ()=>{
        let colorInd=0;
        varTimer=setInterval(()=>{
            element.style.color=colors[colorInd];
            colorInd++;
            if(colorInd==colors.length){
                colorInd=0;
            }
        }, 1000);
    });
    element.removeEventListener("mouseout", ()=>{
        clearInterval(varTimer);
    });
}

function toggleView(element){
    element.classList.toggle("hide");
    element.classList.toggle("show");
}

function hideView(element){
    if(!element.classList.contains("hide")){
        toggleView(element);
    }
}

function removeClass(element, oldClass){
    if(element.classList.contains(oldClass)){
        element.classList.remove(oldClass);
    }
}

function addClass(element, newClass){
    if(!element.classList.contains(newClass)){
        element.classList.add(newClass);
    }
}

function getElement(element)
{
    return document.querySelector(`${element}`);
}

function getElements(element)
{
    return document.querySelectorAll(`${element}`);
}

function getHighScore(mode){
    return Number.parseInt(localStorage.getItem(mode));
}

function setHighScore(mode, score){
    console.log(score);
    localStorage.setItem(mode, JSON.stringify(score));
}

function endPageContent(mode, curScore){
    const message = getElement("#Message");
    const highScore = getHighScore(mode);
    if(curScore==20){
        addColorChanger(message);
        addColorChanger(getElement("#EndPage"));
        message.innerHTML=`Congratulations! You got full 20 points for ${mode} mode. Nothing short of sheer dedication could have taken you this far! The dev tips his hat to you, one legend to another`;
        getElement("#EndPage").classList.add("full");
    }
    else if(curScore==0){
        message.innerHTML=`Aww, you got 0 points for ${mode} mode. Better luck next time. Remember that failures are the stepping stones to success. Keep trying and you will make it! Thank you for playing.`;
    }
    else if(curScore==highScore){
        addColorChanger(message);
        message.innerHTML=`Congratulations! You equalled the high score of ${curScore} points for ${mode} mode. We hope you had fun and thank you for playing.`;
        getElement("#EndPage").classList.add("equal");
    }
    else if(curScore>highScore){
        addColorChanger(message);
        setHighScore(mode, curScore);
        message.innerHTML=`Congratulations! You set a new high score of ${curScore} points for ${mode} mode. The previous high score was ${highScore} points. We hope you had fun and thank you for playing.`;
        getElement("#EndPage").classList.add("beat");
    }
    else{
        message.innerHTML=`Thank you for taking this ${mode} mode quiz. Your score is ${curScore} points. We hope you had a good time and learned something new.`;
    }
}

async function getQuestions(){
    const res= await fetch("https://opentdb.com/api.php?amount=21&type=multiple");
    const data = await res.json();
    return data.results;
}

function correctOrder(){
    return Math.floor(Math.random()*4)+1;
}

function setQuestion(questionBox, question, i){
    questionBox.innerHTML = i+". "+question;
}

function setOptionChar(optionInd){
    return String.fromCharCode(64+optionInd);
}

function updateScore(choice){
    const score=getElement(".score");
    if(choice==-2){
        score.style.color = "turquoise";
    }
    else if(choice==0){
        score.style.color = "bisque";
    }
    else if(choice==1){
        score.style.color = "chartreuse";
        curScore++;
    }
    else{
        score.style.color = "crimson";
    }
    score.innerHTML = `Score-${curScore}`;
}

function initialiseScores(){
    for(let i=0;i<=20;i=i+1){
        localStorage.setItem("B"+i, "0");
        localStorage.setItem("C"+i, "0");
    }
}

function recordScore(mode, curScore){
    let occurred=Number.parseInt(localStorage.getItem(mode[0]+curScore));
    localStorage.setItem(mode[0]+curScore, (occurred+1).toString());
}

function nextRound(choice, curQuestionNo, totalQuestionNo, questions, choices){
    if(choice==0){
        if(lifeLines>=1){
            lifeLines=lifeLines-1;
            choices.push(-1);
            updateScore(-2, curScore);
        }
        else{ 
            choices.push(0);
            updateScore(0, curScore);
        }
    }
    else{
        choices.push(Number.parseInt(choice.id[choice.id.length-1]));
        if(choices[choices.length-1]==choices[choices.length-2]){
            updateScore(1, curScore);
        }
        else{
            updateScore(-1, curScore);
        }
    }
    if((curQuestionNo===totalQuestionNo && lifeLines===1) ||(curQuestionNo>totalQuestionNo)){
        if(curQuestionNo===totalQuestionNo && lifeLines===1){
            choices.push(-1);
            choices.push(-1);
        }
        endPage("Bullet", questions, choices);
    }
    else{
        runBulletMode(questions, curQuestionNo, totalQuestionNo, choices);
    }
}

function setOption(optionInd, option, curQuestionNo, totalQuestionNo, questions, choices)
{
    const choice=getElement(`#Option${optionInd}`);
    choice.innerHTML = setOptionChar(optionInd)+". "+option;
    choice.addEventListener("click", click =>{
        const selected=click.target;
        isClicked=1;
        ifSelected=selected;
    }, false);
}

function updateTimer(time){
    const timer=getElement(".timer");
    if(time<4){
        timer.style.color="red";
        timer.innerHTML = `Time left-00:0${time}`;
    }
    else if(time<10){
        timer.style.color="bisque";
        timer.innerHTML = `Time left-00:0${time}`;
    }
    else{
        timer.style.color="bisque";
        timer.innerHTML = `Time left-00:${time}`;
    }
}

function clearCorrects(mode){
    for(let i=1;i<=4;i++){
        const choice=getElement(`#Option${i}`);
        removeClass(choice, "correct");
        removeClass(choice, "wrong");
    }
}

function clearOptions(mode){
    for(let i=1;i<=4;i++){
        const choice=getElement(`#Option${i}`);
        choice.removeEventListener("click", click =>{
            const selected=click.target;
            isClicked=1;
            ifSelected=selected;
        }, false);
    }
}

function showOptions(question, choices, curQuestionNo){
    let correctInd=choices[curQuestionNo*2];
    let choiceInd=choices[curQuestionNo*2+1];
    const timer=getElement(".timer");
    timer.style.color="bisque";
    timer.innerHTML="Skipped question";
    for(let i=1, k=0;i<=4;i++){
        const choice=getElement(`#Option${i}`);
        if(i===correctInd){
            removeClass(choice, "wrong")
            addClass(choice, "correct");
            choice.innerHTML=setOptionChar(i)+". "+question.correct_answer;
            if(choiceInd===correctInd){
                timer.style.color="chartreuse";
                timer.innerHTML="Correct answer";
            }
        }
        else if(i===choiceInd){
            removeClass(choice, "correct");
            addClass(choice, "wrong");
            choice.innerHTML=setOptionChar(i)+". "+question.incorrect_answers[k];
            k++;
            timer.style.color="crimson";
            timer.innerHTML="Wrong answer";
        }
        else{
            removeClass(choice, "correct");
            removeClass(choice, "wrong");
            choice.innerHTML=setOptionChar(i)+". "+question.incorrect_answers[k];
            k++;
        }
    }
    if(choiceInd==-1){
        timer.style.color="turquoise";
        timer.innerHTML="Lifeline Used";
    }
}

/*Run Functions*/
function setRound(options, curQuestionNo, totalQuestionNo, questions, choices){
    let correctInd=correctOrder();
    choices.push(correctInd);
    setQuestion(getElement("#BQuestion"), options.question, curQuestionNo);
    for(let j=1, k=0;j<=4;j++){
        if(j===correctInd){
            setOption(j, options.correct_answer, curQuestionNo, totalQuestionNo, questions, choices);
        }
        else{
            setOption(j, options.incorrect_answers[k], curQuestionNo, totalQuestionNo, questions, choices);
            k++;
        }
    }
}

async function runBulletRound(runBulletMode, time, curQuestionNo, totalQuestionNo, questions, choices){
    let n=time/1000;
    updateTimer(n);
    let i=0;
    for(; i<n; i++){
        if(isClicked===1){
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateTimer(n-i-1);
    }
    if(isClicked){
        nextRound(ifSelected, curQuestionNo+1, totalQuestionNo, questions, choices);
    }
    else{
        nextRound(0, curQuestionNo+1, totalQuestionNo, questions, choices);
    }
}

async function runBulletMode(questions, curQuestionNo, totalQuestionNo, choices){
    isClicked=0;
    setRound(questions[curQuestionNo-1], curQuestionNo, totalQuestionNo, questions, choices);
    await new Promise(resolve =>runBulletRound(runBulletMode, 15000, curQuestionNo, totalQuestionNo, questions, choices));   //await new Promise(resolve => setTimeout(resolve, 1000));
} 

function showRound(mode, question, choices, curQuestionNo){
    setQuestion(getElement("#BQuestion"), question.question, curQuestionNo+1);
    showOptions(question, choices, curQuestionNo);
}

function removeNav(mode){
    const mover=getElement("#"+"Mover");
    removeClass(mover, "nav");
    const prevBtn=getElement("#PrevBtn");
    const nextBtn=getElement("#NextBtn");
    const endBtn=getElement("#EndBtn");
    prevBtn.removeEventListener("click", click=>{
        isClicked=-1;
    });
    endBtn.removeEventListener("click", click=>{
        isClicked=2;
    });
    nextBtn.removeEventListener("click", click=>{
        isClicked=1;
    });
    getElement("#Header").style.minHeight="20vh";
    getElement("#BulletMode").style.minHeight="80vh";
    toggleView(mover);
}

function displayNav(mode){
    const mover=getElement("#Mover");
    addClass(mover, "grids");
    const prevBtn=getElement("#PrevBtn");
    const nextBtn=getElement("#NextBtn");
    const endBtn=getElement("#EndBtn");
    prevBtn.addEventListener("click", click=>{
        isClicked=-1;
    });
    endBtn.addEventListener("click", click=>{
        isClicked=2;
    });
    nextBtn.addEventListener("click", click=>{
        isClicked=1;
    });
    getElement("#Header").style.minHeight="15vh";
    getElement("#BulletMode").style.minHeight="75vh";
    toggleView(mover);
}

async function showScores(mode, questions, choices){
    toggleView(getElement("#EndPage"));
    toggleView(getElement("#"+mode+"Mode"));
    clearOptions(mode);
    displayNav(mode);
    for(let i=0; i<21;){
        showRound(mode, questions[i], choices, i);
        isClicked=0;
        while(true){
            if(isClicked!=0){
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        if(isClicked===1)
        {
            if(i===20){
                i=0;
                continue;
            }
            else if(i===19&& lifeLines===1){
                i=0;
                continue;
            }
            i++;
        }
        else if(isClicked===-1){
            if(i===0){
                if(lifeLines===0){
                    i=20;
                }
                else{
                    i=19;
                }
                continue;
            }
            i--;
        }
        else{
            removeNav(mode);
            restartApp();
        }
    }
}
/*End Functions*/
function endPage(mode, questions, choices){
    removeColorChanger(getElement("#Message"));
    removeColorChanger(getElement("#EndPage"));
    toggleView(getElement(mode==="Bullet" ? "#BulletMode" : "#ClassicMode"));
    endPageContent(mode, curScore);
    recordScore(mode, curScore);
    const restartBtn = getElement("#RestartBtn");
    restartBtn.innerHTML=`${mode} Mode`;
    restartBtn.addEventListener("click", launchBulletMode, false);
    const showScoresBtn = getElement("#ShowScoresBtn");
    showScoresBtn.addEventListener("click", event=>{
        showScores(mode, questions, choices);
        }, false);
    const homeBtn=getElement("#HomeBtn");
    homeBtn.addEventListener("click", restartApp, false);
    toggleView(getElement("#EndPage"));
    
}

/*Launch Functions*/
async function launchBulletMode (){
    removeClass(getElement("#EndPage"), "full");
    removeClass(getElement("#EndPage"), "beat");
    removeClass(getElement("#EndPage"), "equal");
    curScore=0;
    lifeLines=1;
    const bulletMode = getElement("#BulletMode");
    toggleView(bulletMode);
    hideView(getElement("#Home"));
    hideView(getElement("#EndPage"));
    const questions= await getQuestions();
    const choices=[];
    await runBulletMode(questions, 1, 21, choices);
}

function showHighScores(){
    getElement("#CRecord").innerHTML="High Score: "+getHighScore("Classic");
    getElement("#BRecord").innerHTML="High Score: "+getHighScore("Bullet");
    getElement("#HomePageBtn").addEventListener("click", restartApp);
    let CScores=1, BScores=1;
    for(let i=20; i>=0; i--){
        if(CScores===6 && BScores===6){
            break;
        }
        if(localStorage.getItem("C"+i)!="0"){
            getElement("#C"+CScores+"Score").innerHTML=i;
            getElement("#C"+CScores+"Occur").innerHTML=localStorage.getItem("C"+i);
            CScores++;
        }
        if(localStorage.getItem("B"+i)!="0"){
            getElement("#B"+BScores+"Score").innerHTML=i;
            getElement("#B"+BScores+"Occur").innerHTML=localStorage.getItem("B"+i);
            BScores++;
        }
    }
    toggleView(getElement("#Home"));
    toggleView(getElement("#HighScores"));
    
}

async function launchApp() {
    getElements(".BlitzQuiz").forEach((element)=>{
        addColorChanger(element);
    })
    const rules=getElement("#BRules")
    getElement("#BSeeMore").addEventListener("mouseover", ()=>{
        toggleView(rules);
        rules.style.display="inline";

    });
    getElement("#BSeeMore").addEventListener("mouseout", ()=>{
        rules.style.display="none";
        toggleView(rules);
    });
    if(getHighScore("Bullet")!=0 && !getHighScore("Bullet")){
        initialiseScores();
        setHighScore("Classic", 0);
        setHighScore("Bullet", 0);
    }
    const bulletModeBtn = getElement("#BulletModeBtn");
    bulletModeBtn.addEventListener("click", launchBulletMode, false);
    const highScoresBtn=getElement("#HighScoresBtn");
    highScoresBtn.addEventListener("click", showHighScores);
}
/*Restart Functions*/
function restartApp(){
    location.reload();
}
document.addEventListener("DOMContentLoaded", this.launchApp, false);

