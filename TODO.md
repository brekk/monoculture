# Completed Tasks

 - [x] we need to deal with topological sorting w/r/t async, I would guess this is not correct / timely, but not certain. **Complete!** we're using @hapi/topo for now, it has a nice feature set but it is a little inelegant
 - [x] we need to have the same automatic segmentation that happens to `state` happen for pulling `config`. Things like `robot-tourist` have a lot of knobs / configuration, that should be easily segmented or made accessible through `monorail` **Complete!** Now the rulefile can contain configuration details which get passed along to plugins and are accessible via the `config` helper
 - [x] we need to support rulefiles (the combination of configuration for `monocle` so you can have repeatable runs / diarrhea) **Complete!** This works pretty well, and leverages `climate` very easily
 - [x] In the same way we do `/src` we should probably use a pattern like `/dist` for artifacts, it would help disambiguate and signal intent very easily. **Complete!** We have migrated everything to use a `/dist` pattern
 - [x] Right now we're using a build step on everything, but we should move to pure ESM for anything in `packages` (or similar) **Complete!** Not everything can be ESM (because some things are designed to be tools, so they need to be bundled.) But we have a reusable pattern to use by convention now, and hopefully we can leverage `monocle` to enforce it in the future.

# Incomplete Tasks

## General

 - [-] Add a utility library for some basics, like strings, arrays, Sets + Maps - **Updated!** We have `knot` for strings. And `inherent` for some tacit toolbelt stuff.
 - [ ] we should have some shit for TS, even though it is a garbage type system of garbage -- `remeda`?
   - [ ] can we automate this magically?
 - [ ] We can likely save more on repeated configuration by consolidating things (either on `nps` or `superorganism`)
 - [ ] Let's do some stuff with `transduce`!

## Workspaces

### superorganism

 - [ ] `superorganism` needs more work -- if we're gonna re-imagine how `nps` config files are, we may need a backwards-compatible legacy mode, or we're already pretty coupled with `nps` in most of these packages.

### robot-tourist

 - [ ] `robot-tourist` should have more tests because it has some edges which don't fully remove / clean JS/TS syntax

### gitparty

 - [ ] `treacle` should maybe eventually be wired to the new `gitparty`

### clox

 - [ ] `clox` could support subdividable space
 - [ ] `clox` is a bad name

### monorail

 - [ ] we should have an `extends` or similar syntax so that you can easily extend another input file

### manacle

 - [ ] we need to build rules / `manacle`

### doctor-general

 - [ ] `doctor-general` has some edges which either aren't well documented or have bad defaults (specifically, `@page` + `@pageSummary` stuff right now), we should clean that up so that we have better automatically generated content
 - [ ] `doctor-general` needs to have `@group` and `@addTo` documented (and tests updated)
 - [ ] `doctor-general` hangs indefinitely on inline `{@link hookInfo}` stuff
 - [x] We should support a means of expressing curried morphisms succinctly. **Completed!** See `file-system/fs.js` for an example, but now we can support this via a special `@curried` tag.
 - [ ] Apply [diátaxis](https://diataxis.fr/) framework
   - [ ] Tutorials - Step the user through a concrete problem, with a modicum of explanation. Focus on the user's education. Work on basic competence. Apply a clear and managed path and work towards a conclusion.
   - [ ] How-To - Step through a concrete real-world problem, focusing on the user's work. Help improve the already competent user. Aim for a clear result but expect the path to be less linear.
   - [x] Reference - Describe the product / software clearly, authoritatively and unambiguously. **Complete!** Arguably we do this today, that's what `doctor-general` was originally designed for.
   - [ ] Explanation - Provide context for broader understanding of things. Help provide a rationale for choices. Admit opinion and perspective.
 - [x] AUTOMATICALLY GENERATE TESTS FROM COMMENTS! **Completed!** This is a little brittle currently, but really awesome.
   - [ ] We need to have a more robust means of handling imports, right now it's likely to break
 - [ ] Right now `@example` assumes it will be the last entry, but that's not super robust, we should write a more comprehensive test for this

