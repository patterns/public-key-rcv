import React from 'react'


const SequenceNumber =  (props) => {

  return (
    <li>
      <div>
      <span id="{props.name}" >{props.name}</span>
      </div>
    </li>
  )
} 

export { SequenceNumber }

