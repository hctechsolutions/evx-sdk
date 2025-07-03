import 'reflect-metadata';

// Configure BigInt serialization for Jest
if (typeof BigInt !== 'undefined') {
  (BigInt.prototype as any).toJSON = function() {
    return this.toString();
  };
} 