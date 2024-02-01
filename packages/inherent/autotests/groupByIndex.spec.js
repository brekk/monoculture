// This test automatically generated by doctor-general.
// Sourced from 'groupByIndex.js', edits to this file may be erased.
import {
  
} from '../groupByIndex'


test('groupByIndex', () => {
  expect(groupByIndex(0, [
    ['spades', 'ace'],
    ['diamonds', 'seven'],
    ['hearts', 'eight'],
    ['clubs', 'jack'],
    ['diamonds', 'ace'],
    ['spades', 'king'],
    ['diamonds', 'four'],
    ['spades', 'eight'],
  ])).toEqual({
    clubs: [['jack']],
    diamonds: [['seven'], ['ace'], ['four']],
    hearts: [['eight']],
    spades: [['ace'], ['king'], ['eight']],
  })
})

test('groupFlatByIndex', () => {
  expect(groupFlatByIndex(0, [
    ['spades', 'ace'],
    ['diamonds', 'seven'],
    ['hearts', 'eight'],
    ['clubs', 'jack'],
    ['diamonds', 'ace'],
    ['spades', 'king'],
    ['diamonds', 'four'],
    ['spades', 'eight'],
  ])).toEqual({
    clubs: ['jack'],
    diamonds: ['seven', 'ace', 'four'],
    hearts: ['eight'],
    spades: ['ace', 'king', 'eight'],
  })
})