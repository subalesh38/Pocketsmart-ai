import pytest
from unittest.mock import patch, MagicMock
from app.services.gemini_client import generate_json
from app.core.errors import AppError

@pytest.fixture
def mock_client():
    with patch("app.services.gemini_client.get_client") as mock:
        client_instance = MagicMock()
        mock.return_value = client_instance
        yield client_instance

def test_generate_json_success(mock_client):
    mock_response = MagicMock()
    mock_response.text = '{"success": true}'
    mock_client.models.generate_content.return_value = mock_response

    res = generate_json("test prompt")
    assert res == '{"success": true}'
    assert mock_client.models.generate_content.call_count == 1

@patch("time.sleep", return_value=None)
def test_generate_json_retry_then_success(mock_sleep, mock_client):
    mock_response = MagicMock()
    mock_response.text = '{"success": true}'
    
    mock_client.models.generate_content.side_effect = [
        Exception("Transient"),
        mock_response
    ]

    res = generate_json("test prompt")
    assert res == '{"success": true}'
    assert mock_client.models.generate_content.call_count == 2
    mock_sleep.assert_called_once_with(1)

@patch("time.sleep", return_value=None)
def test_generate_json_failure(mock_sleep, mock_client):
    mock_client.models.generate_content.side_effect = Exception("Transient")

    with pytest.raises(AppError) as exc:
        generate_json("test prompt")
    
    assert exc.value.code == "AI_UNAVAILABLE"
    assert exc.value.status_code == 503
    assert mock_client.models.generate_content.call_count == 2
