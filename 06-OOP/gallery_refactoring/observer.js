export class Subject {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

export class Observer {
  update(data) {
    throw new Error("구현해!");
  }
}
