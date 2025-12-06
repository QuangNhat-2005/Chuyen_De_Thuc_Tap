import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// 1. Định nghĩa kiểu dữ liệu cho Payload
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  // 2. XÓA CHỮ 'async' Ở ĐÂY ĐI
  validate(payload: JwtPayload) {
    // TypeScript giờ đã biết chắc chắn payload có .sub, .email, .role
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
