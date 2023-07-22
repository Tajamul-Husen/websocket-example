class Test {
  constructor(name) {
    const _name = name.toUpperCase();
    this.name = name;
  }

  getName() {
    return this.name;
  }

  getUpper() {
    return _name;
  }
}


const t = new Test('john');
console.log(t.getName()) 
console.log(t.getUpper());