export function remapImports<T,Y>(x: Promise<T>, map: (a:T) =>Y): Promise<Y> {
  return x.then(map);
}
