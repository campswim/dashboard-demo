const actions = {
  unpulled: [
    {
      pathname: '/failed-orders',
      postPath: 'failedPulls',
      action: 'Repull',
      actionId: 'unpulled',
      onClickArg: 'repullCrmOrders',
      title: 'Repull'
    },
    {
      pathname: '/failed-orders',
      postPath: 'CrmOrders',
      action: 'Ignore',
      actionId: 'unpulled',
      onClickArg: 'ignoreCrmOrders',
      title: 'Ignore'
    }
  ],
  unpushed: [
    {
      pathname: '/failed-orders',
      postPath: 'failedPushes',
      action: 'Repush',
      actionId: 'unpushed',
      onClickArg: 'repushFailedStagedOrders',
      title: 'Repush'
    },
    {
      pathname: '/failed-orders',
      postPath: 'StagingOrders',
      action: 'Ignore',
      actionId: 'unpushed',
      onClickArg: 'ignoreFailedStagedOrders',
      title: 'Ignore'
    },
    {
      pathname: '/failed-orders',
      postPath: 'StagingOrders',
      action: 'Delete',
      actionId: 'unpushed',
      onClickArg: 'deleteFailedStagedOrder',
      title: 'Delete'
    }
  ],
  ignored: [
    {
      pathname: '/failed-orders',
      postPath: '',
      action: 'Unignore',
      actionId: 'ignored',
      onClickArg: 'unignoreOrder',
      title: 'Unignore'
    }
  ]
};

export default actions;
