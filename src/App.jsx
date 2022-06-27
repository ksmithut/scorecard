import React from 'react'
import { useGameState } from './lib/game-state.js'
import useSubmit from './lib/use-submit.js'
import Button from './components/Button.jsx'

export default function App () {
  const [state, actions] = useGameState()
  const {
    addPlayer: handleAddPlayer,
    removePlayer: handleRemovePlayer,
    addRound: handleAddRound,
    removeRound: handleRemoveRound,
    changePlayerScore: handlePlayerScoreChange,
    collapseRounds: handleCollapseRounds,
    undo: handleUndo,
    redo: handleRedo
  } = actions
  return (
    <div className='flex w-screen h-screen flex-col'>
      <div className='flex-1 overflow-y-scroll'>
        <table className='overflow-y-auto block whitespace-nowrap pb-3 h-full'>
          <thead className='sticky top-0 bg-white shadow'>
            <tr className='border'>
              <th />
              {state.players.map(player => (
                <PlayerHeader
                  key={player.id}
                  player={player}
                  onRemovePlayer={handleRemovePlayer}
                />
              ))}
              <AddPlayerHeader onAddPlayer={handleAddPlayer} />
            </tr>
          </thead>
          <tbody>
            {state.rounds.map((round, i) => (
              <RoundRow
                key={round.id}
                round={round}
                roundIndex={i}
                players={state.players}
                onScoreChange={handlePlayerScoreChange}
                onRemoveRound={handleRemoveRound}
              />
            ))}
            <TotalRow players={state.players} rounds={state.rounds} />
          </tbody>
        </table>
      </div>
      <div className='p-2 border-t flex gap-2 text-xs sm:text-sm md:text-base'>
        <Button onClick={() => handleAddRound()}>Add Round</Button>
        <Button
          disabled={state.rounds.length <= 1}
          onClick={() => handleCollapseRounds()}
        >
          Collapse Rounds
        </Button>
        <Button
          disabled={state.undoStates.length === 0}
          onClick={() => handleUndo()}
        >
          ↶ Undo
        </Button>
        <Button
          disabled={state.redoStates.length === 0}
          onClick={() => handleRedo()}
        >
          Redo ↷
        </Button>
      </div>
    </div>
  )
}

function PlayerHeader ({ player, onRemovePlayer }) {
  const handleRemoveClick = React.useCallback(() => onRemovePlayer(player.id), [
    player.id,
    onRemovePlayer
  ])
  return (
    <th className='w-28 p-0 border'>
      <div className='w-28'>
        {player.name}&nbsp;&nbsp;&nbsp;
        <button className='text-red-400' onClick={handleRemoveClick}>
          ✘
        </button>
      </div>
    </th>
  )
}

function AddPlayerHeader ({ onAddPlayer }) {
  const handleSubmit = useSubmit(
    React.useCallback(
      (data, form) => {
        if (!data.name?.trim()) return
        onAddPlayer(data.name.trim())
        form.reset()
      },
      [onAddPlayer]
    )
  )
  return (
    <th>
      <form onSubmit={handleSubmit}>
        <input
          className='w-32 px-2 py-1'
          type='text'
          name='name'
          placeholder='Player Name'
        />
        <Button type='submit'>Add Player</Button>
      </form>
    </th>
  )
}

function RoundRow ({
  round,
  roundIndex,
  players,
  onScoreChange,
  onRemoveRound
}) {
  const handlePlayerScoreChange = React.useCallback(
    (playerId, score) => onScoreChange(round.id, playerId, score),
    [onScoreChange, round.id]
  )
  const handleRemoveRow = React.useCallback(
    e => {
      e.preventDefault()
      onRemoveRound(round.id)
    },
    [round.id]
  )
  return (
    <tr>
      <td className='border p-3 text-right'>{roundIndex + 1}</td>
      {players.map(player => (
        <td className='border p-1' key={player.id}>
          <PlayerRoundScore
            player={player}
            score={round.scores[player.id]}
            onChange={handlePlayerScoreChange}
          />
        </td>
      ))}
      <td className='border p-1'>
        <Button onClick={handleRemoveRow}>Remove Round</Button>
      </td>
    </tr>
  )
}

function PlayerRoundScore ({ player, score = 0, onChange }) {
  const [value, setValue] = React.useState(score)
  const handleInputChange = React.useCallback(e => {
    setValue(e.target.valueAsNumber)
  }, [])
  const handleFocus = React.useCallback(e => {
    e.target.select()
    return false
  }, [])
  const handleBlur = React.useCallback(
    e => {
      if (value !== score) onChange(player.id, value)
    },
    [player.id, value, onChange]
  )
  React.useEffect(() => setValue(score), [score])
  return (
    <div className='flex justify-center'>
      <input
        className='text-center w-full h-16 text-lg'
        type='number'
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleFocus}
      />
    </div>
  )
}

/**
 * @param {object} props
 * @param {import('./lib/game-state.js').Player[]} props.players
 * @param {import('./lib/game-state.js').Round[]} props.rounds
 */
function TotalRow ({ players, rounds }) {
  if (!rounds.length) return null
  const scores = players.map(player => {
    const score = rounds.reduce((score, round) => {
      return score + (round.scores[player.id] ?? 0)
    }, 0)
    return { id: player.id, score }
  })
  return (
    <tr>
      <td />
      {scores.map(score => {
        return (
          <td key={score.id}>
            <div className='flex align-middle justify-center p-4 text-lg  w-full'>
              {score.score}
            </div>
          </td>
        )
      })}
    </tr>
  )
}
