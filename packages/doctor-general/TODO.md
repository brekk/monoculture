- [ ] - Add `processor` validation
- [ ] - Maybe create a new library to aid creating new processors?
- [ ] - Add more tests
- [ ] - Improve parsing generally
      - We should have a common & easily understood heuristic for how it parses
        
        there should only be three(?) kinds of tags

         1. ephemeral - these tags do specific, sometimes "magical" things and may
            have effects beyond the comment block they are written in:
            
             - `@group`
             - `@page`
             - `@pageSummary`
             - `@addTo`
             - `@curried`
             - more ?

         2. single-line - ` * @blah zipzap zipzop\n` / ` * @blah {aFormat} [toParse] no newline yet`
         3. multi-line - ` * @heyYou it is actually\n * not syllable based, you know\n * cutting lines have great import`
            - minor caveat -- things like `@example` have a well defined start and end, so currently content defined in one of those specialized tags, but after their well-defined end, will ostensibly be truncated
         4. inline - `{@line reference.for.listeners}` which can be used within any (multi-line content) or 
            the summary (the content before any tag

      The general process by which it should parse:

      1. As long as we are in a comment-block which starts with `/**` and ends with `*/`
      2. Which may or may not start with an asterisk and a space `* ` or any number of leading spaces followed by an asterisk and a space `      * content`
      3. Blocks are cleaned up (w/r/t point 2 / asterisks only) and then split between "tags" (like `@name`) which start a line
      4. Things are left-associative, the content before the first tag is assumed to be the summary of the content
      
         

- [ ] - Add more extant JSDoc tags
      - `@summary` - shorter version of default summary
      - `@link` - link stuff to stuff, including inline `{@link cool.nice}`
      - `@alias` - we definitely want this, and we might want to use this to replace some custom tags we've made
      - `@module` - useful for linking stuff / identification
      - `@param` - since we might wanna leverage this for side-channel types, this should work
      - `@access` - we could leverage this to help identify stuff we don't want to push to full documentation (since we've now conflated documentation and tests)
      - `@ignore` - same!
      - `@variation` - another means of segmentation
      - `@todo` - This would be a nice means of tying known issues to code
- [ ] - `s/curried/curriedExample/g`? (that way we could leverage `@curried` to indicate a curried function without necessarily implying there will be multiple examples)
- [ ] - I think it would be valuable to have some kind of `@testFixture` code tag which captures reusable info for tests
- [ ] - It would also be cool if there was a means of creating a `@testSpec` code tag which allowed you to define a specification that could then be linked via `@implements` / `@see`
- [ ] - It might be nice to make it so that if no inputs are provided for drgen to search all files for `/**` comments
- [ ] - Support `@signature` or similar for HM types

- [ ] - uhhhhh, shouldn't we wire `doctor-general` to its own action hook?
