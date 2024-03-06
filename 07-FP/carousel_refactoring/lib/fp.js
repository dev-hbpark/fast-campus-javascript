export const range = (limit) => {
  let i = -1;
  const res = [];
  while (++i < limit) {
    res.push(i);
  }
  return res;
};

export const numbers = range(100);

// f(0, 1) = 실행, f(0) = 함수 반환
export const curry =
  (f) =>
  (a, ...args) => {
    return args.length > 0 ? f(a, ...args) : (...args) => f(a, ...args);
  };

export const map = curry((f, iter) => {
  let result = [];
  console.log(f, iter);
  const iterator = iter[Symbol.iterator]();
  let current = iterator.next();
  while (!current.done) {
    result.push(f(current.value));
    current = iterator.next();
  }
  return result;
});

export const take = curry((limit, iter) => {
  let res = [];
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    const a = cur.value;
    res.push(a);
    if (res.length == limit) return res;
  }
  return res;
});

export const filter = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    if (f(a)) res.push(a);
  }
  return res;
});

export const reduce = curry((f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  } else {
    iter = iter[Symbol.iterator]();
  }
  for (const a of iter) {
    acc = f(acc, a);
  }
  return acc;
});

export const go = (...args) => reduce((a, f) => f(a), args);

export const lazyMap = curry(function* (f, iter) {
  for (const a of iter) {
    yield f(a);
  }
});

export const lazyFilter = curry(function* (f, iter) {
  for (const a of iter) {
    if (f(a)) yield a;
  }
});
