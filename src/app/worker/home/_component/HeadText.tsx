import React from 'react'

const HeadText = ({ username = '사용자', text }: { username?: string; text: string }) => {
  // \n 기준으로 split → <br/> 넣어서 렌더링
  const renderText = () =>
    text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))

  return (
    <h1 className="text-2xl font-display mb-6">
      <strong>{username}</strong>님,
      <br />
      {renderText()}
    </h1>
  )
}

export default HeadText
