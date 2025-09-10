export const useFeatureFlags = () => {
  return {
    profile: __PROFILE__,
    features: {
      owner: __FEATURE_OWNER__,
      admin: __FEATURE_ADMIN__,
      pro: __FEATURE_PRO__,
      predictive: __FEATURE_PREDICTIVE__,
      photo: __FEATURE_PHOTO__,
      autopilot: __FEATURE_AUTOPILOT__,
      exports: __FEATURE_EXPORTS__,
      enps: __FEATURE_ENPS__,
      advancedAnalytics: __FEATURE_ADVANCED_ANALYTICS__,
      integrations: __FEATURE_INTEGRATIONS__,
      nlp: __FEATURE_NLP__,
    },
    isMVP: __PROFILE__ === 'MVP_AOBI',
    isFull: __PROFILE__ === 'FULL',
  };
};

export default useFeatureFlags;
