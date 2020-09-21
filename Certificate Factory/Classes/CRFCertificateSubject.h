#import <Foundation/Foundation.h>
#import <openssl/x509v3.h>

@interface CRFCertificateSubject : NSObject

@property (strong, nonatomic, nonnull) NSString * country;
@property (strong, nonatomic, nonnull) NSString * state;
@property (strong, nonatomic, nonnull) NSString * city;
@property (strong, nonatomic, nonnull) NSString * organization;
@property (strong, nonatomic, nonnull) NSString * department;
@property (strong, nonatomic, nonnull) NSString * commonName;

- (X509_NAME * _Nonnull) x509Name;
+ (CRFCertificateSubject * _Nullable) subjectFromX509:(X509 * _Nonnull)cert;

@end
