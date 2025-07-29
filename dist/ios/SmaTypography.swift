import UIKit

struct TypographyToken {
  let fontFamily: String
  let fontSize: CGFloat
  let fontWeight: Int
  let lineHeight: CGFloat
  let letterSpacing: CGFloat
}

class SmaTypography {
  public static let DisplayXlarge = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 96,
    fontWeight: 700,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let DisplayLarge = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 72,
    fontWeight: 700,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let DisplayMedium = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 64,
    fontWeight: 700,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let DisplaySmall = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let Headline3xlargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 40,
    fontWeight: 400,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let Headline3xlargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 40,
    fontWeight: 500,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let Headline3xlargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 40,
    fontWeight: 600,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let Headline2xlargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 34,
    fontWeight: 400,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let Headline2xlargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 34,
    fontWeight: 500,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let Headline2xlargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 34,
    fontWeight: 600,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let HeadlineXlargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 28,
    fontWeight: 400,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let HeadlineXlargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 28,
    fontWeight: 500,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let HeadlineXlargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 110,
    letterSpacing: -2
  )

  public static let HeadlineLargeLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineMediumLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 400,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineMediumRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineMediumProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineSmallLight = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineSmallRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let HeadlineSmallProminant = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 120,
    letterSpacing: -2
  )

  public static let BodyXLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 400,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let BodyXLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let BodyLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let BodyLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let BodyMediumRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let BodyMediumProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let BodySmallRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let BodySmallProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 150,
    letterSpacing: -1
  )

  public static let LabelXlargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 100,
    letterSpacing: -1
  )

  public static let LabelXlargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 100,
    letterSpacing: -1
  )

  public static let LabelLargeRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 100,
    letterSpacing: -1
  )

  public static let LabelLargeProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 100,
    letterSpacing: -1
  )

  public static let LabelMediumRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 100,
    letterSpacing: -1
  )

  public static let LabelMediumProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 100,
    letterSpacing: -1
  )

  public static let LabelSmallRegular = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 100,
    letterSpacing: -1
  )

  public static let LabelSmallProminent = TypographyToken(
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 100,
    letterSpacing: -1
  )
}