import React from 'react';

type Props = React.PropsWithChildren<{

}>

export class Overlay extends React.Component<Props, {}> {
  render() {
    return <>
      {this.props.children}
    </>
  }
}
