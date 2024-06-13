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
  ],
  jobError: [
    {
      pathname: '/failed-processes',
      postPath: '',
      action: 'Dismiss',
      actionId: 'dismissed',
      onClickArg: 'dismissJobError',
      title: 'Dismiss'
    },
    {
      pathname: '/failed-processes',
      postPath: '',
      action: 'Reinstate',
      actionId: 'reinstated',
      onClickArg: 'reinstateJobError',
      title: 'Reinstate'
    }
  ],
  paymentError: [
    {
      pathname: 'failed-payments',
      postPath: '',
      action: 'Dismiss',
      actionId: 'dismissed',
      onClickArg: 'dismissPaymentError',
      title: 'Dismiss'
    },
    // {
    //   pathname: 'failed-payments',
    //   postPath: '',
    //   action: 'Reinstate',
    //   actionId: 'reinstated',
    //   onClickArg: 'reinstatePaymentError',
    //   title: 'Reinstate'
    // }
  ]
};

export default actions;
