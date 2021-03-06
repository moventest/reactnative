import React from 'react';
import { ActivityIndicator, FlatList, NativeModules, View } from 'react-native';
import ActionButton from 'react-native-action-button';
import Toast from 'react-native-easy-toast';
import firebase from 'react-native-firebase';
import translate from '../../services/i18n';
import { ListItem } from '../list-item/index';

export class UsersList extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: typeof (navigation.state.params) === 'undefined' || typeof (navigation.state.params.title) === 'undefined' ? 'Users\' list' : navigation.state.params.title,
  });

  constructor(props) {
    super(props);
    this.state = { isLoading: true, dataSource: [] };
    this.ref = firebase.firestore().collection('users');
    this.unsubscribe = null;
    this.props.navigation.setParams({ title: translate('list.title') });
    this.toast = null;
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot((querySnapshot) => this.onCollectionUpdate(querySnapshot));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onCollectionUpdate(querySnapshot) {
    const data = [];
    querySnapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    this.setState({
      isLoading: false,
      dataSource: data
    });
    NativeModules.Timer.getStartupTime().then((result) => {
      const startupTime = new Date().getTime() - result.startupTime;
      setTimeout(() => this.toast.show(startupTime), 1000);
    });
  }

  render() {
    const { navigate } = this.props.navigation;

    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.dataSource}
          renderItem={({ item }) => (
            <ListItem
              onPress={(id) => navigate('Detail', { id })}
              user={item} />
          )}
          keyExtractor={(user) => user.id}
        />
        <ActionButton
          buttonColor="rgba(231,76,60,1)"
          onPress={() => navigate('Detail', { id: -1 })}
        />
        <Toast ref={ref => {
          this.toast = ref;
        }} />
      </View>
    );
  }
}
