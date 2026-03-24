//
//  TVAppShell.swift
//  Native tvOS wrapper that hosts the React web app in a WKWebView.
//
//  Usage:
//  1. Create a new tvOS project in Xcode
//  2. Add this file to the project
//  3. Set the webAppURL to your deployed React app URL
//  4. Build and run on Apple TV simulator or device
//

import UIKit
import WebKit

class TVAppViewController: UIViewController, WKScriptMessageHandler {

    private var webView: WKWebView!
    private let webAppURL = URL(string: "http://localhost:5173")! // Change to production URL

    override func viewDidLoad() {
        super.viewDidLoad()

        let config = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        contentController.add(self, name: "tvApp")

        let bridgeScript = WKUserScript(
            source: "window.__TVOS_BRIDGE__ = true;",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        contentController.addUserScript(bridgeScript)
        config.userContentController = contentController
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)
        webView.load(URLRequest(url: webAppURL))
    }

    func userContentController(_ userContentController: WKUserContentController,
                                didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let type = body["type"] as? String else { return }

        switch type {
        case "playMedia":
            if let payload = body["payload"] as? [String: Any],
               let urlString = payload["url"] as? String {
                print("Play media: \(urlString)")
            }
        case "topShelf":
            print("Update top shelf")
        default:
            print("Unknown message type: \(type)")
        }
    }

    func sendToJS(type: String, payload: [String: Any]) {
        let message: [String: Any] = ["type": type, "payload": payload]
        if let jsonData = try? JSONSerialization.data(withJSONObject: message),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            webView.evaluateJavaScript("window.__tvos_receive(\(jsonString))")
        }
    }
}
