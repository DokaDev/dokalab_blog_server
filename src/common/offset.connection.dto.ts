export class OffsetConnectionDto<T> {
  getNodes: () => Promise<T[]>;
  getTotalCount: () => Promise<number>;
}
