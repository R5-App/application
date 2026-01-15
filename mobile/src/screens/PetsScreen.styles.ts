import { StyleSheet, useWindowDimensions } from 'react-native';

export const useStyles = () => {
  const { height } = useWindowDimensions();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    emptyText: {
      marginTop: 8,
      textAlign: 'center',
      color: '#666',
    },
    listContent: {
      padding: 16,
    },
    card: {
      marginBottom: 12,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });
};
