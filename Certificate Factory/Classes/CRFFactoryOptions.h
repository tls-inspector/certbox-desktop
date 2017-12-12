#import <Foundation/Foundation.h>
#import "CRFFactoryCertificateRequest.h"

@interface CRFFactoryOptions : NSObject

typedef NS_ENUM(NSUInteger, CFFactoryExportType) {
    EXPORT_PEM,
    EXPORT_PKCS12,
};

@property (strong, nonatomic, nonnull) NSString * exportPassword;
@property (nonatomic) CFFactoryExportType exportType;
@property (strong, nonatomic, nullable) CRFFactoryCertificateRequest * caRequest;
@property (strong, nonatomic, nonnull) CRFFactoryCertificateRequest * serverRequest;

@end
