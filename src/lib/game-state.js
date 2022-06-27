import React from 'react'
import { createStorage } from './storage.js'

const ADD_PLAYER = 'ADD_PLAYER'
const REMOVE_PLAYER = 'REMOVE_PLAYER'
const ADD_ROUND = 'ADD_ROUND'
const REMOVE_ROUND = 'REMOVE_ROUND'
const CHANGE_PLAYER_SCORE = 'CHANGE_PLAYER_SCORE'
const RESET_ROUNDS = 'RESET_ROUNDS'
const COLLAPSE_ROWS = 'COLLAPSE_ROWS'
const UNDO = 'UNDO'
const REDO = 'REDO'

/**
 * @typedef {object} Player
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {object} Round
 * @property {string} id
 * @property {Record<string, number>} scores
 */

/**
 * @typedef {object} GameState
 * @property {Player[]} players
 * @property {Round[]} rounds
 * @property {GameState[]} undoStates
 * @property {GameState[]} redoStates
 */

const MAX_HISTORY = 10

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function gameStateReducer (state, action) {
  switch (action.type) {
    case ADD_PLAYER:
      return {
        ...state,
        players: [
          ...state.players,
          { id: action.payload.id, name: action.payload.name }
        ],
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: []
      }
    case REMOVE_PLAYER:
      return {
        ...state,
        players: state.players.filter(
          player => player.id !== action.payload.id
        ),
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: []
      }
    case ADD_ROUND:
      return {
        ...state,
        rounds: [...state.rounds, { id: action.payload.id, scores: {} }],
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: []
      }
    case REMOVE_ROUND:
      return {
        ...state,
        rounds: state.rounds.filter(round => round.id !== action.payload.id),
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: []
      }
    case CHANGE_PLAYER_SCORE:
      return {
        ...state,
        rounds: state.rounds.map(round =>
          round.id === action.payload.roundId
            ? {
                ...round,
                scores: {
                  ...round.scores,
                  [action.payload.playerId]: action.payload.score
                }
              }
            : round
        ),
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: []
      }
    case RESET_ROUNDS:
      return {
        ...state,
        rounds: [],
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: []
      }
    case COLLAPSE_ROWS:
      return {
        ...state,
        rounds: [
          {
            id: action.payload.id,
            scores: state.rounds.reduce((scores, round) => {
              return Object.entries(round.scores).reduce(
                (scores, [playerId, score]) => {
                  scores[playerId] = (scores[playerId] ?? 0) + score
                  return scores
                },
                scores
              )
            }, {})
          }
        ],
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: []
      }
    case UNDO: {
      const oldState = state.undoStates[0]
      if (!oldState) return state
      return {
        ...oldState,
        undoStates: state.undoStates.slice(1),
        redoStates: [state, ...state.redoStates]
      }
    }
    case REDO: {
      const prevState = state.redoStates[0]
      if (!prevState) return state
      return {
        ...prevState,
        undoStates: [state, ...state.undoStates].slice(0, MAX_HISTORY),
        redoStates: state.redoStates.slice(1)
      }
    }
    default:
      return state
  }
}

/**
 * @param {string} id
 * @param {string} name
 */
function addPlayer (id, name) {
  return {
    type: ADD_PLAYER,
    payload: { id, name }
  }
}

/**
 * @param {string} id
 */
function removePlayer (id) {
  return {
    type: REMOVE_PLAYER,
    payload: { id }
  }
}

/**
 * @param {string} id
 */
function addRound (id) {
  return {
    type: ADD_ROUND,
    payload: { id }
  }
}

/**
 * @param {string} id
 */
function removeRound (id) {
  return {
    type: REMOVE_ROUND,
    payload: { id }
  }
}

/**
 * @param {string} roundId
 * @param {string} playerId
 * @param {number} score
 */
function changePlayerScore (roundId, playerId, score) {
  return {
    type: CHANGE_PLAYER_SCORE,
    payload: { roundId, playerId, score }
  }
}

function resetRounds () {
  return { type: RESET_ROUNDS }
}

function collapseRounds (id) {
  return { type: COLLAPSE_ROWS, payload: { id } }
}

function undo () {
  return { type: UNDO }
}

function redo () {
  return { type: REDO }
}

/**
 * @typedef {object} Actions
 * @property {(name: string) => void} addPlayer
 * @property {(id: string) => void} removePlayer
 * @property {() => void} addRound
 * @property {(id: string) => void} removeRound
 * @property {(roundId: string, playerId: string, score: number) => void} changePlayerScore
 * @property {() => void} resetRounds
 * @property {() => void} collapseRounds
 * @property {() => void} undo
 * @property {() => void} redo
 */

const storage = createStorage(
  'game',
  /**
   * @returns {GameState}
   */
  () => ({
    players: [],
    rounds: [{ id: crypto.randomUUID(), scores: {} }],
    undoStates: [],
    redoStates: []
  })
)

/**
 * @returns {[GameState, Actions]}
 */
export function useGameState () {
  const initialState = React.useMemo(() => storage.get(), [])
  const [state, dispatch] = React.useReducer(gameStateReducer, initialState)
  React.useEffect(() => {
    storage.set({
      ...state,
      undoStates: [],
      redoStates: []
    })
  }, [state])
  const actions = React.useMemo(
    /**
     * @returns {Actions}
     */
    () => ({
      addPlayer (name) {
        dispatch(addPlayer(crypto.randomUUID(), name))
      },
      removePlayer (id) {
        dispatch(removePlayer(id))
      },
      addRound () {
        dispatch(addRound(crypto.randomUUID()))
      },
      removeRound (id) {
        dispatch(removeRound(id))
      },
      changePlayerScore (roundId, playerId, score) {
        dispatch(changePlayerScore(roundId, playerId, score))
      },
      resetRounds () {
        dispatch(resetRounds())
      },
      collapseRounds () {
        dispatch(collapseRounds(crypto.randomUUID()))
      },
      undo () {
        dispatch(undo())
      },
      redo () {
        dispatch(redo())
      }
    }),
    []
  )
  return [state, actions]
}
