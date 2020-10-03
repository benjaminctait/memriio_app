import React, {Component} from 'react';

import {StyleSheet, View} from 'react-native';

export default class DrawCircle extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.CircleShapeView} />

        <View style={styles.OvalShapeView} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },

  CircleShapeView: {
    width: 150,
    height: 150,
    borderRadius: 150 / 2,
    backgroundColor: '#00BCD4',
  },

  OvalShapeView: {
    marginTop: 20,
    width: 100,
    height: 100,
    backgroundColor: '#00BCD4',
    borderRadius: 50,
    transform: [{scaleX: 2}],
  },
});
