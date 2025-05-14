export type MainStackParamList = {
	MainTabs: { screen?: keyof MainTabsParamList } | undefined;
	SecondScreen: undefined;
	ProfileDetails: { isEditMode?: boolean; returnScreen?: string; userRole?: string };
	SchedulePickup: undefined;
	PickupScheduled: undefined;
	RoleSelect: undefined;
	WelcomeBack: undefined;
	Volunteer: undefined;
	VolunteerProfile: undefined;
	NGODashboard: undefined;
};

export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
	ForgetPassword: undefined;
};

export type MainTabsParamList = {
	Home: undefined;
	Profile: undefined;
	About: undefined;
	Community: undefined;
};
