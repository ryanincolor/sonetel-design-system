import SwiftUI

// MARK: - Typography Protocol
public protocol SmaTypographyProtocol {
  static var font: Font { get }
  static var fontSize: CGFloat { get }
  static var lineHeight: CGFloat { get }
  static var letterSpacing: CGFloat { get }
}

// MARK: - Typography ViewModifier
public struct TypographyStyle<Style>: ViewModifier where Style: SmaTypographyProtocol {
  public func body(content: Content) -> some View {
    content
      .font(Style.font)
      .kerning(Style.letterSpacing)
      .lineSpacing(Style.lineHeight - Style.fontSize)
  }
}

// MARK: - View Extension
public extension View {
  func typography<Style: SmaTypographyProtocol>(_ style: Style.Type) -> some View {
    modifier(TypographyStyle<Style>())
  }
}

// MARK: - Typography Tokens
public struct SmaTypography {
  // MARK: - Display

  public struct displayXLarge: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 96).weight(.bold)
    public static let fontSize: CGFloat = 96
    public static let lineHeight: CGFloat = 106
    public static let letterSpacing: CGFloat = -2
  }

  public struct displayLarge: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 72).weight(.bold)
    public static let fontSize: CGFloat = 72
    public static let lineHeight: CGFloat = 79
    public static let letterSpacing: CGFloat = -2
  }

  public struct displayMedium: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 64).weight(.bold)
    public static let fontSize: CGFloat = 64
    public static let lineHeight: CGFloat = 70
    public static let letterSpacing: CGFloat = -2
  }

  public struct displaySmall: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 56).weight(.bold)
    public static let fontSize: CGFloat = 56
    public static let lineHeight: CGFloat = 62
    public static let letterSpacing: CGFloat = -2
  }

  // MARK: - Headline

  public struct headline3xLargeLight: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 40)
    public static let fontSize: CGFloat = 40
    public static let lineHeight: CGFloat = 44
    public static let letterSpacing: CGFloat = -2
  }

  public struct headline3xLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 40).weight(.medium)
    public static let fontSize: CGFloat = 40
    public static let lineHeight: CGFloat = 44
    public static let letterSpacing: CGFloat = -2
  }

  public struct headline3xLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 40).weight(.semibold)
    public static let fontSize: CGFloat = 40
    public static let lineHeight: CGFloat = 44
    public static let letterSpacing: CGFloat = -2
  }

  public struct headline2xLargeLight: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 34)
    public static let fontSize: CGFloat = 34
    public static let lineHeight: CGFloat = 37
    public static let letterSpacing: CGFloat = -2
  }

  public struct headline2xLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 34).weight(.medium)
    public static let fontSize: CGFloat = 34
    public static let lineHeight: CGFloat = 37
    public static let letterSpacing: CGFloat = -2
  }

  public struct headline2xLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 34).weight(.semibold)
    public static let fontSize: CGFloat = 34
    public static let lineHeight: CGFloat = 37
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineXLargeLight: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 28)
    public static let fontSize: CGFloat = 28
    public static let lineHeight: CGFloat = 31
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineXLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 28).weight(.medium)
    public static let fontSize: CGFloat = 28
    public static let lineHeight: CGFloat = 31
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineXLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 28).weight(.semibold)
    public static let fontSize: CGFloat = 28
    public static let lineHeight: CGFloat = 31
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineLargeLight: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 24)
    public static let fontSize: CGFloat = 24
    public static let lineHeight: CGFloat = 29
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 24).weight(.medium)
    public static let fontSize: CGFloat = 24
    public static let lineHeight: CGFloat = 29
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 24).weight(.semibold)
    public static let fontSize: CGFloat = 24
    public static let lineHeight: CGFloat = 29
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineMediumLight: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 20)
    public static let fontSize: CGFloat = 20
    public static let lineHeight: CGFloat = 24
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineMediumRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 20).weight(.medium)
    public static let fontSize: CGFloat = 20
    public static let lineHeight: CGFloat = 24
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineMediumProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 20).weight(.semibold)
    public static let fontSize: CGFloat = 20
    public static let lineHeight: CGFloat = 24
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineSmallLight: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 18)
    public static let fontSize: CGFloat = 18
    public static let lineHeight: CGFloat = 22
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineSmallRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 18).weight(.medium)
    public static let fontSize: CGFloat = 18
    public static let lineHeight: CGFloat = 22
    public static let letterSpacing: CGFloat = -2
  }

  public struct headlineSmallProminant: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 18).weight(.semibold)
    public static let fontSize: CGFloat = 18
    public static let lineHeight: CGFloat = 22
    public static let letterSpacing: CGFloat = -2
  }

  // MARK: - Body

  public struct bodyXLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 20)
    public static let fontSize: CGFloat = 20
    public static let lineHeight: CGFloat = 30
    public static let letterSpacing: CGFloat = -1
  }

  public struct bodyXLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 20).weight(.medium)
    public static let fontSize: CGFloat = 20
    public static let lineHeight: CGFloat = 30
    public static let letterSpacing: CGFloat = -1
  }

  public struct bodyLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 16)
    public static let fontSize: CGFloat = 16
    public static let lineHeight: CGFloat = 24
    public static let letterSpacing: CGFloat = -1
  }

  public struct bodyLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 16).weight(.medium)
    public static let fontSize: CGFloat = 16
    public static let lineHeight: CGFloat = 24
    public static let letterSpacing: CGFloat = -1
  }

  public struct bodyMediumRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 14)
    public static let fontSize: CGFloat = 14
    public static let lineHeight: CGFloat = 21
    public static let letterSpacing: CGFloat = -1
  }

  public struct bodyMediumProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 14).weight(.medium)
    public static let fontSize: CGFloat = 14
    public static let lineHeight: CGFloat = 21
    public static let letterSpacing: CGFloat = -1
  }

  public struct bodySmallRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 12)
    public static let fontSize: CGFloat = 12
    public static let lineHeight: CGFloat = 18
    public static let letterSpacing: CGFloat = -1
  }

  public struct bodySmallProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 12).weight(.medium)
    public static let fontSize: CGFloat = 12
    public static let lineHeight: CGFloat = 18
    public static let letterSpacing: CGFloat = -1
  }

  // MARK: - Label

  public struct labelXLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 20).weight(.medium)
    public static let fontSize: CGFloat = 20
    public static let lineHeight: CGFloat = 20
    public static let letterSpacing: CGFloat = -1
  }

  public struct labelXLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 20).weight(.semibold)
    public static let fontSize: CGFloat = 20
    public static let lineHeight: CGFloat = 20
    public static let letterSpacing: CGFloat = -1
  }

  public struct labelLargeRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 16).weight(.medium)
    public static let fontSize: CGFloat = 16
    public static let lineHeight: CGFloat = 16
    public static let letterSpacing: CGFloat = -1
  }

  public struct labelLargeProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 16).weight(.semibold)
    public static let fontSize: CGFloat = 16
    public static let lineHeight: CGFloat = 16
    public static let letterSpacing: CGFloat = -1
  }

  public struct labelMediumRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 14).weight(.medium)
    public static let fontSize: CGFloat = 14
    public static let lineHeight: CGFloat = 14
    public static let letterSpacing: CGFloat = -1
  }

  public struct labelMediumProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 14).weight(.semibold)
    public static let fontSize: CGFloat = 14
    public static let lineHeight: CGFloat = 14
    public static let letterSpacing: CGFloat = -1
  }

  public struct labelSmallRegular: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 12).weight(.medium)
    public static let fontSize: CGFloat = 12
    public static let lineHeight: CGFloat = 12
    public static let letterSpacing: CGFloat = -1
  }

  public struct labelSmallProminent: SmaTypographyProtocol {
    public static let font: Font = .custom("Inter", size: 12).weight(.semibold)
    public static let fontSize: CGFloat = 12
    public static let lineHeight: CGFloat = 12
    public static let letterSpacing: CGFloat = -1
  }
}