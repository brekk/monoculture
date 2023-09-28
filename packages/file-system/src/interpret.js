import { Future } from 'fluture'

export const interpret = filepath =>
  Future((bad, good) => {
    import(filepath).catch(bad).then(good)
    return () => {}
  })
