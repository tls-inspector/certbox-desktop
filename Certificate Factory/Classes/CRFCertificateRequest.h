#import <Foundation/Foundation.h>
#import "CRFSANObject.h"
#import "CRFCertificateSubject.h"
#import "CRFCertificate.h"
#import "CRFKeyUsage.h"

@interface CRFCertificateRequest : NSObject

typedef NS_ENUM(NSUInteger, CFFactoryKeyAlgType) {
    KEY_ALG_RSA,
    KEY_ALG_ECDSA,
};

@property (strong, nonatomic, nonnull) NSString * serial;
@property (nonatomic) CFFactoryKeyAlgType keyType;
@property (strong, nonatomic, nonnull) NSDate * dateStart;
@property (strong, nonatomic, nonnull) NSDate * dateEnd;
@property (strong, nonatomic, nonnull) CRFCertificateSubject * subject;
@property (strong, nonatomic, nullable) CRFCertificateSubject * issuer;
@property (strong, nonatomic, nullable) NSArray<CRFSANObject *> * sans;
@property (strong, nonatomic, nonnull) NSArray<CRFKeyUsage *> * usage;
@property (strong, nonatomic, nullable) NSArray<NSURL *> * crlURLs;
@property (strong, nonatomic, nullable) NSURL * ocspURL;
@property (nonatomic) BOOL isCA;
@property (nonatomic) EVP_PKEY * _Nullable rootPkey;

- (CRFCertificate * _Nullable) generate:(NSError * _Nullable * _Nonnull)error;
+ (CRFCertificateRequest * _Nullable) requestWithExistingPKCSPath:(NSURL * _Nonnull)path importPassword:(NSString * _Nonnull)password;

@end
