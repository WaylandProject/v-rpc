
/**
 * Represents the unique id generator for requests
 */
class IdGenerator {
  /**
   * Generates a random unique id
   * 
   * @returns A random integer
   */
  protected generateId(): number {
    return Math.round(2147483648 - (Math.random() * 4294967296));
  }
}

export default IdGenerator;
