import React from 'react';
import {
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import { AdMobInterstitial } from 'react-native-admob';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from 'react-native-navbar';
import Sound from 'react-native-sound';
import Speech from 'react-native-speech';

// Component
import AdmobCell from './admob';

import commonStyle from '../common-styles';
import tracker from '../tracker';

const styles = StyleSheet.create(Object.assign({}, commonStyle, {
  block: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 20,
    borderRightWidth: StyleSheet.hairlineWidth * 2,
    borderRightColor: '#CCCCCC',
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    padding: 6,
    paddingLeft: 20,
    marginHorizontal: 10,
    marginVertical: 5,
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth * 2,
    borderRightColor: '#CCCCCC',
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: '#CCCCCC',
    backgroundColor: 'white',
  },
  wordText: {
    fontSize: 18,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 30,
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
}));

export default class LessonView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };
  }

  componentDidMount() {
    this.prepareRows();
  }

  onPlaySound(pageData) {
    if (Platform.OS === 'ios') {
      Speech.speak({
        text: pageData.word,
        voice: 'th-TH',
        rate: 0.2,
      });
    } else if (Platform.OS === 'android') {
      if (pageData.sound) {
        const s = new Sound(pageData.sound, Sound.MAIN_BUNDLE, (e) => {
          if (e) {
            console.log('error', e);
          } else {
            console.log('duration', s.getDuration());
            s.play();
          }
        });
      } else {
        Speech.speak({
          text: pageData.word,
          voice: 'th_TH',
          rate: 0.2,
          forceStop: true,
        });
      }
    }
    tracker.trackEvent('user-action', 'play-card-sound', { label: pageData.word });
  }

  prepareRows() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.props.vocabulary),
    });
  }

  popAndAd() {
    if (Math.random() > 0.9) {
      AdMobInterstitial.requestAd(() => AdMobInterstitial.showAd(error => error && console.log(error)));
    }
    Actions.pop();
  }

  renderToolbar() {
    if (Platform.OS === 'ios') {
      return (
        <NavigationBar
          statusBar={{ style: 'light-content', tintColor: '#4CAF50' }}
          style={styles.navigatorBarIOS}
          title={{ title: this.props.title, tintColor: 'white' }}
          leftButton={
            <TouchableOpacity onPress={() => this.popAndAd()}>
              <Icon style={styles.navigatorLeftButton} name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
          }
        />
      );
    } else if (Platform.OS === 'android') {
      return (
        <Icon.ToolbarAndroid
          navIconName="arrow-back"
          onIconClicked={this.popAndAd}
          style={styles.toolbar}
          title={this.props.title}
          titleColor="white"
        />
      );
    }
  }

  render() {
    tracker.trackScreenView('lesson');
    return (
      <View style={styles.container}>
        {this.renderToolbar()}
        <ListView
          dataSource={this.state.dataSource}
          renderRow={rowData => <TouchableOpacity onPress={() => this.onPlaySound(rowData)}>
            <View style={styles.row}>
              <Text style={styles.wordText}>{rowData.word}</Text>
              {(rowData.translation || rowData.entranslation) && <Text style={styles.translationText}>{rowData.translation} {rowData.entranslation}</Text>}
            </View>
          </TouchableOpacity>}
        />
        <AdmobCell />
        <ActionButton buttonColor="#4CAF50">
          <ActionButton.Item buttonColor="#9B59B6" title="Test／測驗" onPress={() => Actions.assignment({ title: this.props.title, vocabulary: this.props.vocabulary })}>
            <Icon name="assignment" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor="#3498DB" title="Flash Card／閃卡" onPress={() => Actions.card({ title: this.props.title, vocabulary: this.props.vocabulary })}>
            <Icon name="layers" style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </View>
    );
  }
}

LessonView.propTypes = {
  title: React.PropTypes.string,
  vocabulary: React.PropTypes.arrayOf(React.PropTypes.object),
};

LessonView.defaultProps = {
  title: '',
  vocabulary: [],
};
