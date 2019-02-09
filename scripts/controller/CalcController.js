class CalcController {
  constructor() {
    this._locale = 'pt-BR';
    this._currentDate;
    this._displayCalcEl = document.querySelector('#display');
    this._dateEl = document.querySelector('#data');
    this._timeEl = document.querySelector('#hora');
    this._operation = [];
    this._lastOperator = '';
    this._lastNumber = '';
    this._audioOn = false;
    this._audio = new Audio('media/click.mp3');
    this.initialize();
    this.initButtonEvents();
    this.initKeyboard();
  }

  initialize() {
    this.setDisplayDateTime();
    setInterval(() => {
      this.setDisplayDateTime()
    }, 1000);
    this.setLastNumberToDisplay();
    this.pasteFromClipboard();

    document.querySelectorAll('.btn-ac').forEach(btn => {
      btn.addEventListener('dblclick', e => {
        this.toggleAudio();
      });
    });
  }

  toggleAudio() {
    this._audioOn = !this._audioOn;
  }

  playAudio() {
    if (this._audioOn) {
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  copyToClipboard() {
    let input = document.createElement('input');
    input.value = this.displayCalc;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    input.remove();
  }

  pasteFromClipboard() {
    document.addEventListener('paste', e => {
      let text = e.clipboardData.getData('Text');
      this.displayCalc = parseFloat(text);
    });
  }

  initKeyboard() {
    document.addEventListener('keyup', e => {

      this.playAudio();
      switch (e.key) {
        case 'Escape':
          this.clearAll();
          break;
        case 'Backspace':
          this.clearEntry();
          break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
          this.addOperation(e.key);
          break;
        case 'Enter':
        case '=':
          this.calc();
          break;
        case '.':
        case ',':
          this.addDot();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.addOperation(parseInt(e.key));
          break;
        case 'c':
          if (e.ctrlKey) {
            this.copyToClipboard();
          }
      }
    });
  }

  initButtonEvents() {

    //querySelectorAll traz todos os elementos encontrados
    let buttons = document.querySelectorAll('#calculadora button');

    //a partir de 2 elementos, passar em parênteses
    buttons.forEach((btn, index) => {
      this.addEventListenerAll(btn, 'click drag', e => {
        let textBtn = btn.innerText;
        this.execBtn(textBtn);
      });

      this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
        btn.style.cursor = 'pointer';
      })
    });
  }

  execBtn(value) {
    this.playAudio();
    switch (value) {
      case 'CE':
        this.clearAll();
        break;
      case 'C':
      case '←': //clearlastentry
        this.clearEntry();
        break;
      case '+':
      case '-':
      case '%':
        this.addOperation(value);
        break;
      case 'X':
        this.addOperation('*');
        break;
      case '÷':
        this.addOperation('/');
        break;
      case '=':
        this.calc();
        break;
      case ',':
        this.addDot();
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.addOperation(parseInt(value));
        break;

      default:
        debugger;
        this.setError();
        break;
    }
  }

  getLastOperation() {
    return this._operation[this._operation.length - 1];
  }

  isOperator(value) {
    return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
  }

  setLastOperation(value) {
    this._operation[this._operation.length - 1] = value;
  }

  pushOperation(value) {
    this._operation.push(value);

    if (this._operation.length > 3) {
      this.calc();
    }
  }

  getResult() {
    try {
      return eval(this._operation.join(''));
    } catch (e) {
      console.error(e)
      setTimeout(() => {
        this.setError();
      }, 1);
    }
  }

  calc() {
    let last = '';
    this._lastOperator = this.getLastItem();

    if (this._operation.length < 3) {
      let firstItem = this._operation[0];
      this._operation = [firstItem, this._lastOperator, this._lastNumber];
    }

    if (this._operation.length > 3) {
      last = this._operation.pop();
      this._lastNumber = this.getResult();
    } else if (this._operation.length == 3) {
      this._lastNumber = this.getLastItem(false);
    }

    let result = this.getResult();

    if (last == '%') {
      result /= 100;
      this._operation = [result];
    } else {
      this._operation = [result];
      if (last) {
        this._operation.push(last);
      }
    }
    this.setLastNumberToDisplay();
  }

  getLastItem(isOperator = true) {
    let lastItem;
    for (let i = this._operation.length - 1; i >= 0; i--) {

      if (isOperator == this.isOperator(this._operation[i])) {
        lastItem = this._operation[i];
        break;
      }
    }

    if (!lastItem) {
      lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
    }

    return lastItem;
  }

  setLastNumberToDisplay() {
    let lastNumber = this.getLastItem(false);
    if (!lastNumber) {
      lastNumber = 0;
    }

    this.displayCalc = lastNumber;
  }

  addOperation(value) {
    if (isNaN(this.getLastOperation())) {
      if (this.isOperator(value)) {
        this.setLastOperation(value);
      } else {
        this.pushOperation(value);
        this.setLastNumberToDisplay();
      }
    } else {
      if (this.isOperator(value)) {
        this.pushOperation(value);
      } else {
        let newvalue = this.getLastOperation().toString() + value.toString();
        this.setLastOperation(newvalue);
        this.setLastNumberToDisplay();
      }
    }
  }

  setError() {
    this.displayCalc = 'Error';
  }

  addDot() {
    let lastOperation = this.getLastOperation();

    if (typeof lastOperation === 'string' && lastOperation.indexOf('.') > -1) {
      return;
    }

    if (this.isOperator(lastOperation) || !lastOperation) {
      this.pushOperation('0.');
    } else {
      this.setLastOperation(lastOperation.toString() + '.');
    }
    this.setLastNumberToDisplay();
  }

  clearAll() {
    this._operation = [];
    this._lastNumber = '';
    this._lastOperator = '';
    this.setLastNumberToDisplay();
  }

  clearEntry() {
    this._operation.pop();
    this.setLastNumberToDisplay();
  }

  addEventListenerAll(element, events, fn) {
    events.split(' ').forEach(event => {
      element.addEventListener(event, fn);
    })
  }

  setDisplayDateTime() {
    this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    this.displayTime = this.currentDate.toLocaleTimeString(this._locale)
  }

  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(value) {
    this._timeEl.innerHTML = value;
  }

  get displayDate() {
    return this._dateEl.innerHTML;
  }

  set displayDate(value) {
    this._dateEl.innerHTML = value;
  }

  get displayCalc() {
    return this._displayCalcEl.innerHTML;
  }

  set displayCalc(value) {
    if (value.toString().length > 10) {
      this.setError();
      return;
    }
    this._displayCalcEl.innerHTML = value;
  }

  get currentDate() {
    return new Date();
  }

  set currentDate(value) {
    this._currentDate.innerHTML = value;
  }
}
