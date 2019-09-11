
class IdGenerator {
  protected generateId(): number {
    return Math.round(2147483648 - (Math.random() * 4294967296));
  }
}

export default IdGenerator;
