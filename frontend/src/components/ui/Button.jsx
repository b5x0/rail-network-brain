import React from 'react'

function Button({ ButtonContent }) {
  return (
    <div
      className="
        mx-2
        py-2 px-8 text-2xl text-center cursor-pointer rounded-2xl
        bg-blue-950 text-gray-300 my-3

        shadow-[0_10px_0_0_#162430]
        transition-all duration-150 ease-out

        hover:-translate-y-1 hover:shadow-[0_8px_0_0_#162456]
        active:translate-y-1 active:shadow-[0_2px_0_0_#162456]
      "
    >
      {ButtonContent}
    </div>
  )
}

export default Button
