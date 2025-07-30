import UIKit

struct TypographyToken {
  let fontFamily: String
  let fontSize: CGFloat
  let fontWeight: Int
  let lineHeight: CGFloat
  let letterSpacing: CGFloat
}

class SmaTypography {
  public static let displayXLarge = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 96,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let displayLarge = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 72,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let displayMedium = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 64,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let displaySmall = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headline3xLargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 40,
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headline3xLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 40,
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headline3xLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 40,
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headline2xLargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 34,
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headline2xLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 34,
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headline2xLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 34,
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headlineXLargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 28,
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headlineXLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 28,
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headlineXLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: -2
  )

  public static let headlineLargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineMediumLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineMediumRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineMediumProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineSmallLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineSmallRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let headlineSmallProminant = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -2
  )

  public static let bodyXLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let bodyXLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let bodyLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let bodyLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let bodyMediumRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let bodyMediumProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let bodySmallRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let bodySmallProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: -1
  )

  public static let labelXLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: -1
  )

  public static let labelXLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: -1
  )

  public static let labelLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: -1
  )

  public static let labelLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: -1
  )

  public static let labelMediumRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: -1
  )

  public static let labelMediumProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: -1
  )

  public static let labelSmallRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: -1
  )

  public static let labelSmallProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: -1
  )
}