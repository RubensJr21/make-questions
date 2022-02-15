function getDragAfterElement(container, y){
    const draggableElements = [...container.querySelectorAll('.questao:not(.dragging)')]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if(offset < 0 && closest.offset) {
            return { offset, element: child }
        } else {
            return closest
        }
    }, {offset: Number.NEGATIVE_INFINITY}).element
}
document.querySelector(".questoes")
    .addEventListener("dragover", (e) => {
        e.preventDefault()
        const questoes = document.querySelector(".questoes")
        const afterElement = getDragAfterElement(questoes, e.clientY)
        const draggable = document.querySelector(".dragging")
        if(afterElement == null){
            questoes.appendChild(draggable)
        } else {
            questoes.insertBefore(draggable, afterElement)
        }
    })

addQuestion()

async function addQuestion(){
    const questoes = document.querySelector(".questoes")

    // parsing do trecho HTML
    const questionString = (await fetch("templates/elements/questao.html").then(data => data.text())).replace("{{{id}}}", questoes.children.length + 1);
    const parser = new DOMParser();
    // cria um document com html, header, body, etc
    const htmlQuestion = parser.parseFromString(questionString, "text/html");

    const questionElement = htmlQuestion.body.firstChild

    questionElement.addEventListener('dragstart', (event) => {
        const divQuestion = event.target
        divQuestion.classList.add("dragging")
    })
    questionElement.addEventListener('dragend', (event) => {
        const divQuestion = event.target
        divQuestion.classList.remove("dragging")
        updateNumbers()
    })

    questoes.appendChild(questionElement)
}

function removeQuestion(element = new HTMLUnknownElement()){
    const itemQuestion = element.parentElement
    const divQuestions = itemQuestion.parentElement
    divQuestions.removeChild(itemQuestion)
    updateNumbers()
}

function getQuestionsFormated(){
    const questoes = [...document.querySelector(".questoes").children]

    return questoes.map((questao) => {
        const pergunta = questao.querySelector("label.pergunta > input").value
        const alternativa_correta = questao.querySelector(".respostas > label.alternativaCorreta > select").value
        const [a, b, c, d] = ["a","b","c","d"].map(letra => questao.querySelector(`.respostas > .opcoes > label.${letra} > input`).value)
        const extenso = questao.querySelector(`.respostas > label.extenso > input`).value
        const pontuacao = Number(questao.querySelector(`.respostas > label.pontuacao > input`).value)
        return {
            pergunta,
            resposta: {
                alternativa_correta,
                opcoes: {
                    a,
                    b,
                    c,
                    d
                },
                extenso,
            },
            pontuacao,
            classe: ""
        }
    })
}

async function _getCodHTMLFinal(questoes){
    return await fetch("templates/out/jogo.html")
        .then(response => response.text())
        .then(text => {
            return text = text.replace("'${{{questões}}}'", questoes)
        })
}

async function exportHTML(){
    const identArrayOfQuestions = (acumulador, linha, index) => {
        return acumulador += index > 0 ? `    ${linha}\n` : `${linha}\n`
    }
    const questoes = JSON.stringify(getQuestionsFormated(), null, 4)
                        .split("\n")
                        .reduce(identArrayOfQuestions, "")
    const htmlfinal = await _getCodHTMLFinal(questoes)
    console.log(getQuestionsFormated())
}

function updateNumbers(){
    console.log("Atualizando números...")
    const questoes = [...document.querySelector(".questoes").children]
    questoes.forEach((element, index) => {
        const id = element.querySelector(".id")
        id.textContent = id.textContent.replace(/(Questão )[0-9]{1,}/ig, `$1${++index}`)
    })
    console.log("Números Atualizados!")
}