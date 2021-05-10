<?php

namespace LAZ\objects\library\Router;

use LAZ\objects\tools\Logger;
use Psr\Http\Message\ServerRequestInterface;
use Zend\Diactoros\RequestTrait;
use Zend\Diactoros\ServerRequest;

/**
 * Class LazServerRequest
 * @package LAZ\objects\library\Router
 *
 * This temporary class is only in place to help us identify Laz APIs that don't adhere to PSR 7 parsed body rules (they
 * must be null | array | class type).  We don't reject these, but log them.  Any non-compliant apis should be
 * refactored and then we can retire this class.
 */
class LazServerRequest implements ServerRequestInterface {
    use RequestTrait;

    /**
     * @var ServerRequest;
     */
    private $delegate;

    /**
     * Unlike ServerRequest, there is no type restriction in our implementation
     */
    private $parsedBody;

    /**
     * @var Logger
     */
    private $logger;

    public function __construct(ServerRequest $serverRequest) {
        $this->initialize($serverRequest->getUri(), $serverRequest->getMethod(), $serverRequest->getBody(), $serverRequest->getHeaders());
        $this->delegate = $serverRequest;
        $this->parsedBody = $serverRequest->getParsedBody();
        $this->logger = new Logger('LazServerRequest');
    }

    /**
     * {@inheritdoc}
     */
    public function withParsedBody($data) {
        if (!is_array($data) && !is_object($data) && null !== $data) {
            $this->logger->logError(sprintf(
                '%s received %s type data',
                $this->getUri()->getPath(),
                gettype($data)
            ));
        }

        $new = clone $this;
        $new->parsedBody = $data;
        return $new;
    }

    // Delegates -------------------------------------------------------------------------------------------------------

    /**
     * {@inheritdoc}
     */
    public function getServerParams()
    {
        return $this->delegate->getServerParams();
    }

    /**
     * {@inheritdoc}
     */
    public function getUploadedFiles()
    {
        return $this->delegate->getUploadedFiles();
    }

    /**
     * {@inheritdoc}
     */
    public function withUploadedFiles(array $uploadedFiles)
    {
        $new = clone $this;
        $new->delegate = $this->delegate->withUploadedFiles($uploadedFiles);
        return $new;
    }

    /**
     * {@inheritdoc}
     */
    public function getCookieParams()
    {
        return $this->delegate->getCookieParams();
    }

    /**
     * {@inheritdoc}
     */
    public function withCookieParams(array $cookies)
    {
        $new = clone $this;
        $new->delegate = $this->delegate->withCookieParams($cookies);
        return $new;
    }

    /**
     * {@inheritdoc}
     */
    public function getQueryParams()
    {
        return $this->delegate->getQueryParams();
    }

    /**
     * {@inheritdoc}
     */
    public function withQueryParams(array $query)
    {
        $new = clone $this;
        $new->delegate = $this->delegate->withQueryParams($query);
        return $new;
    }

    /**
     * {@inheritdoc}
     */
    public function getParsedBody()
    {
        return $this->parsedBody;
    }

    /**
     * {@inheritdoc}
     */
    public function getAttributes()
    {
        return $this->delegate->getAttributes();
    }

    /**
     * {@inheritdoc}
     */
    public function getAttribute($attribute, $default = null)
    {
        return $this->delegate->getAttribute($attribute, $default);
    }

    /**
     * {@inheritdoc}
     */
    public function withAttribute($attribute, $value)
    {
        $new = clone $this;
        $new->delegate = $this->delegate->withAttribute($attribute, $value);
        return $new;
    }

    /**
     * {@inheritdoc}
     */
    public function withoutAttribute($attribute)
    {
        $new = clone $this;
        $new->delegate = $this->delegate->withoutAttribute($attribute);
        return $new;
    }
}