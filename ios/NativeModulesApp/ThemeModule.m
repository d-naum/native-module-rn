//
//  ThemeModule.m
//  NativeModulesApp
//
//  Created on 2025
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ThemeModule, RCTEventEmitter)

RCT_EXTERN_METHOD(setTheme:(NSString *)theme
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getCurrentTheme:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
