import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { GoogleOAuthService } from './google-oauth.service';
import { OAuthController } from './oauth.controller';

@Module({
  imports: [TenantsModule],
  controllers: [OAuthController],
  providers: [GoogleOAuthService],
  exports: [GoogleOAuthService],
})
export class OAuthModule {}
