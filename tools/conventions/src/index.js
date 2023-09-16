/*

alias Comment = List #[Integer, String]

alias CommentStructure = {
  [String] :: String
}

alias CommentBlock = {
  start :: Integer
  end :: Integer
  lines :: List Comment
  summary :: String
  structure :: CommentStructure
  keywords :: List String
}

alias CommentedFile = {
  comments :: List CommentBlock
  filename :: String
}

*/

export * from './comment'
export * from './file'
export * from './parse'
export * from './text'
