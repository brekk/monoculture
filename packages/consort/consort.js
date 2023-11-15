// src/index.js
import { of, curry, pipe, reduce } from "ramda";
import { callWithScopeWhen, callBinaryWithScopeWhen } from "xtrace";
var world = construct(Map);
var crew = construct(Set);
var ghostCrew = crew(null);
var hasOr = curry((def, x) => {
  x.has(def) || x.set(def, ghostCrew());
  return x;
});
var edgeEffect = curry(
  (step, x) => reduce(
    (edges, [from, to]) => pipe(hasOr(from), hasOr(to), (e) => {
      step([from, to], e);
      return e;
    })(edges),
    world(),
    x
  )
);
var edgesOutgoing = edgeEffect(([from, to], e) => e.get(from).add(to));
var edgesIncoming = edgeEffect(([from, to], e) => e.get(to).add(from));
